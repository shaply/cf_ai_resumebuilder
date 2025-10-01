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
      const userId = 1; // Demo user
      
      // Handle specific item routes: /api/resume-items/:id
      const pathParts = url.pathname.split('/');
      const itemId = pathParts[3]; // /api/resume-items/:id
      
      if (request.method === "GET") {
        try {
          if (itemId && !isNaN(Number(itemId))) {
            // GET single item
            const item = await db.getResumeItemById(Number(itemId));
            if (!item) {
              return Response.json({ 
                success: false, 
                error: "Resume item not found" 
              }, { status: 404 });
            }
            return Response.json({ success: true, data: item });
          } else {
            // GET all items for user
            const items = await db.getResumeItemsByUserId(userId);
            return Response.json({ success: true, data: items });
          }
        } catch (error) {
          return Response.json({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          }, { status: 500 });
        }
      }
      
      if (request.method === "POST") {
        try {
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
            location: data.location || null,
            is_current: data.isCurrent || false,
            tools: data.tools || null,
            project_type: data.projectType || null,
            github_link: data.githubLink || null,
            award: data.award || null,
            resume_item_name: data.resumeItemName || null
          });
          
          return Response.json({ success: true, data: item });
        } catch (error) {
          return Response.json({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          }, { status: 500 });
        }
      }
      
      if (request.method === "PUT") {
        try {
          if (!itemId || isNaN(Number(itemId))) {
            return Response.json({ 
              success: false, 
              error: "Valid item ID is required for updates" 
            }, { status: 400 });
          }
          
          const data = await request.json() as any;
          
          // Verify item exists and belongs to user
          const existingItem = await db.getResumeItemById(Number(itemId));
          if (!existingItem || existingItem.user_id !== userId) {
            return Response.json({ 
              success: false, 
              error: "Resume item not found" 
            }, { status: 404 });
          }
          
          const updates: any = {};
          if (data.type !== undefined) updates.type = data.type;
          if (data.title !== undefined) updates.title = data.title;
          if (data.organization !== undefined) updates.organization = data.organization;
          if (data.startDate !== undefined) updates.start_date = data.startDate;
          if (data.endDate !== undefined) updates.end_date = data.endDate;
          if (data.description !== undefined) updates.description = data.description;
          if (data.location !== undefined) updates.location = data.location;
          if (data.isCurrent !== undefined) updates.is_current = data.isCurrent;
          if (data.tools !== undefined) updates.tools = data.tools;
          if (data.projectType !== undefined) updates.project_type = data.projectType;
          if (data.githubLink !== undefined) updates.github_link = data.githubLink;
          if (data.award !== undefined) updates.award = data.award;
          if (data.resumeItemName !== undefined) updates.resume_item_name = data.resumeItemName;
          
          const updatedItem = await db.updateResumeItem(Number(itemId), updates);
          return Response.json({ success: true, data: updatedItem });
        } catch (error) {
          return Response.json({ 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          }, { status: 500 });
        }
      }
      
      if (request.method === "DELETE") {
        try {
          if (!itemId || isNaN(Number(itemId))) {
            return Response.json({ 
              success: false, 
              error: "Valid item ID is required for deletion" 
            }, { status: 400 });
          }
          
          // Verify item exists and belongs to user
          const existingItem = await db.getResumeItemById(Number(itemId));
          if (!existingItem || existingItem.user_id !== userId) {
            return Response.json({ 
              success: false, 
              error: "Resume item not found" 
            }, { status: 404 });
          }
          
          const deleted = await db.deleteResumeItem(Number(itemId));
          if (deleted) {
            return Response.json({ success: true, message: "Resume item deleted successfully" });
          } else {
            return Response.json({ 
              success: false, 
              error: "Failed to delete resume item" 
            }, { status: 500 });
          }
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
