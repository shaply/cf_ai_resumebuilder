import { routeAgentRequest, type Schedule } from "agents";

import { getSchedulePrompt } from "agents/schedule";

import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  stepCountIs,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet
} from "ai";
import { createWorkersAI } from "workers-ai-provider";
import { processToolCalls, cleanupMessages } from "./utils";
import { tools, executions } from "./tools";

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.getAITools()
    };

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: cleanedMessages,
          dataStream: writer,
          tools: allTools,
          executions
        });

        // Initialize Cloudflare Workers AI model
        const workersai = createWorkersAI({
          binding: this.env.AI
        });
        const model = workersai("@cf/meta/llama-3.1-8b-instruct" as any);

        const result = streamText({
          system: `You are a helpful assistant that can do various tasks... 

${getSchedulePrompt({ date: new Date() })}

If the user asks to schedule a task, use the schedule tool to schedule the task.
`,

          messages: convertToModelMessages(processedMessages),
          model,
          tools: allTools,
          // Type boundary: streamText expects specific tool types, but base class uses ToolSet
          // This is safe because our tools satisfy ToolSet interface (verified by 'satisfies' in tools.ts)
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
          stopWhen: stepCountIs(10)
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    return createUIMessageStreamResponse({ stream });
  }
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        parts: [
          {
            type: "text",
            text: `Running scheduled task: ${description}`
          }
        ],
        metadata: {
          createdAt: new Date()
        }
      }
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/check-ai-key") {
      // With Workers AI, we don't need an API key - it's always available
      return Response.json({
        success: true
      });
    }

    // Database API endpoints
    if (url.pathname.startsWith("/api/resume-items")) {
      const { DatabaseService } = await import("./database");
      const db = new DatabaseService(env.DB);
      
      if (request.method === "GET") {
        try {
          const userId = 1; // Demo user
          const items = await db.getResumeItemsByUserId(userId);
          return Response.json({ success: true, data: items });
        } catch (error) {
          return Response.json({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          }, { status: 500 });
        }
      }
      
      if (request.method === "POST") {
        try {
          const userId = 1; // Demo user
          const data = await request.json() as any;
          
          // Basic validation
          if (!data.type || !data.title) {
            return Response.json({ 
              success: false, 
              error: "Type and title are required" 
            }, { status: 400 });
          }
          
          // Ensure user exists
          let user = await db.getUserById(userId);
          if (!user) {
            user = await db.createUser("demo@example.com", "Demo User");
          }
          
          const item = await db.createResumeItem({
            user_id: userId,
            type: data.type,
            title: data.title,
            organization: data.organization || null,
            start_date: data.startDate || null,
            end_date: data.endDate || null,
            description: data.description || null,
            skills: data.skills ? JSON.stringify(data.skills) : null,
            location: data.location || null,
            is_current: data.isCurrent || false
          });
          
          return Response.json({ success: true, data: item });
        } catch (error) {
          return Response.json({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          }, { status: 500 });
        }
      }
      
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }
    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
