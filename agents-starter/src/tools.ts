/**
 * Tool definitions for the AI chat agent
 * Tools can either require human confirmation or execute automatically
 */
import { tool, type ToolSet } from "ai";
import { z } from "zod/v3";

import type { Chat } from "./server";
import { getCurrentAgent } from "agents";
import { scheduleSchema } from "agents/schedule";

const scheduleTask = tool({
  description: "A tool to schedule a task to be executed at a later time",
  inputSchema: scheduleSchema,
  execute: async ({ when, description }) => {
    // we can now read the agent context from the ALS store
    const { agent } = getCurrentAgent<Chat>();

    function throwError(msg: string): string {
      throw new Error(msg);
    }
    if (when.type === "no-schedule") {
      return "Not a valid schedule input";
    }
    const input =
      when.type === "scheduled"
        ? when.date // scheduled
        : when.type === "delayed"
          ? when.delayInSeconds // delayed
          : when.type === "cron"
            ? when.cron // cron
            : throwError("not a valid schedule input");
    try {
      agent!.schedule(input!, "executeTask", description);
    } catch (error) {
      console.error("error scheduling task", error);
      return `Error scheduling task: ${error}`;
    }
    return `Task scheduled for type "${when.type}" : ${input}`;
  }
});

const saveResumeItem = tool({
  description: "Save a resume item to the database",
  inputSchema: z.object({
    type: z.string().describe("The type of resume item (experience, education, skill, project, etc.)"),
    title: z.string().describe("The title or name of the resume item"),
    organization: z.string().optional().describe("The organization, company, or school name"),
    startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
    endDate: z.string().optional().describe("End date in YYYY-MM-DD format (optional if current)"),
    description: z.string().optional().describe("Detailed description of the experience, education, or project"),
    skills: z.array(z.string()).optional().describe("Array of relevant skills"),
    location: z.string().optional().describe("Location (city, state/country)"),
    isCurrent: z.boolean().optional().describe("Whether this is a current position/enrollment")
  }),
  execute: async (args) => {
    try {
      // Use the API endpoint instead of direct database access
      const response = await fetch("/api/resume-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(args)
      });
      
      const result = await response.json() as any;
      
      if (result.success) {
        return `Successfully saved resume item: ${result.data.title}${result.data.organization ? ` at ${result.data.organization}` : ''}`;
      } else {
        return `Error saving resume item: ${result.error}`;
      }
    } catch (error) {
      return `Error saving resume item: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
});

/**
 * Tool to retrieve user's resume items from the database
 */
const getResumeItems = tool({
  description: "Retrieve all resume items (experiences, projects, education, etc.) for the user",
  inputSchema: z.object({
    type: z.string().optional().describe("Optional: filter by resume item type (experience, education, skill, project, etc.)")
  }),
  execute: async ({ type }) => {
    try {
      // Use the API endpoint instead of direct database access
      const response = await fetch("/api/resume-items");
      const result = await response.json() as any;
      
      if (!result.success) {
        return `Error retrieving resume items: ${result.error}`;
      }
      
      let items = result.data;
      
      // Filter by type if specified
      if (type) {
        items = items.filter((item: any) => item.type.toLowerCase() === type.toLowerCase());
      }
      
      if (items.length === 0) {
        return type ? 
          `No ${type} items found in your resume database.` :
          "No resume items found. You can add items using the 'Add Resume Item' section or ask me to help you add them.";
      }
      
      // Format the items for display
      const formattedItems = items.map((item: any) => {
        const skills = item.skills ? JSON.parse(item.skills) : [];
        const duration = item.start_date && item.end_date ? 
          `${item.start_date} to ${item.end_date}` :
          item.start_date ? `${item.start_date} to ${item.is_current ? 'Present' : 'Not specified'}` :
          'Date not specified';
          
        return `📋 ${item.type.toUpperCase()}: ${item.title}
🏢 Organization: ${item.organization || 'Not specified'}
📅 Duration: ${duration}
📍 Location: ${item.location || 'Not specified'}
🛠️ Skills: ${skills.length > 0 ? skills.join(', ') : 'None listed'}
📝 Description: ${item.description ? item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '') : 'No description'}
🆔 ID: ${item.id}`;
      }).join('\n\n');
      
      return `Found ${items.length} resume item${items.length === 1 ? '' : 's'}:\n\n${formattedItems}`;
      
    } catch (error) {
      console.error('Error retrieving resume items:', error);
      return `Failed to retrieve resume items: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
});

/**
 * Tool to list all scheduled tasks
 * This executes automatically without requiring human confirmation
 */
const getScheduledTasks = tool({
  description: "List all tasks that have been scheduled",
  inputSchema: z.object({}),
  execute: async () => {
    const { agent } = getCurrentAgent<Chat>();

    try {
      const tasks = agent!.getSchedules();
      if (!tasks || tasks.length === 0) {
        return "No scheduled tasks found.";
      }
      return tasks;
    } catch (error) {
      console.error("Error listing scheduled tasks", error);
      return `Error listing scheduled tasks: ${error}`;
    }
  }
});

/**
 * Tool to cancel a scheduled task by its ID
 * This executes automatically without requiring human confirmation
 */
const cancelScheduledTask = tool({
  description: "Cancel a scheduled task using its ID",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to cancel")
  }),
  execute: async ({ taskId }) => {
    const { agent } = getCurrentAgent<Chat>();
    try {
      await agent!.cancelSchedule(taskId);
      return `Task ${taskId} has been successfully canceled.`;
    } catch (error) {
      console.error("Error canceling scheduled task", error);
      return `Error canceling task ${taskId}: ${error}`;
    }
  }
});

/**
 * Export all available tools
 * These will be provided to the AI model to describe available capabilities
 */
export const tools = {
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask,
  saveResumeItem,
  getResumeItems
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 */
export const executions = {
  getWeatherInformation: async ({ city }: { city: string }) => {
    console.log(`Getting weather information for ${city}`);
    return `The weather in ${city} is sunny`;
  }
};
