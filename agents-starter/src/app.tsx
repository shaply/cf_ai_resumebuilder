/** biome-ignore-all lint/correctness/useUniqueElementIds: it's alright */
import { useEffect, useState, useRef, useCallback, use } from "react";
import { useAgent } from "agents/react";
import { isToolUIPart } from "ai";
import { useAgentChat } from "agents/ai-react";
import type { UIMessage } from "@ai-sdk/react";
import type { tools } from "./tools";

// Component imports
import ThemeSelector from "@/components/orbit-site/ThemeSelector";
import { AddResumeItemContent } from "./components/Resume/AddResumeItem";
import { EditResumeItemContent } from "./components/Resume/EditResumeItem";
import { BuildResumeContent } from "./components/Resume/BuildResume";

// Icon imports

// Resume Builder Components

// List of tools that require human confirmation
// NOTE: this should match the tools that don't have execute functions in tools.ts

export default function Chat() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    // Check localStorage first, default to dark if not found
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "dark" | "light") || "dark";
  });
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Apply theme class on mount and when theme changes
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    // Save theme preference to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll to bottom on mount
  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const agent = useAgent({
    agent: "chat"
  });

  const [agentInput, setAgentInput] = useState("");
  const handleAgentInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAgentInput(e.target.value);
  };

  const handleAgentSubmit = async (
    e: React.FormEvent,
    extraData: Record<string, unknown> = {}
  ) => {
    e.preventDefault();
    if (!agentInput.trim()) return;

    const message = agentInput;
    setAgentInput("");

    // Send message to agent
    await sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: message }]
      },
      {
        body: extraData
      }
    );
  };

  const {
    messages: agentMessages,
    addToolResult,
    clearHistory,
    status,
    sendMessage,
    stop
  } = useAgentChat<unknown, UIMessage<{ createdAt: string }>>({
    agent
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    agentMessages.length > 0 && scrollToBottom();
  }, [agentMessages, scrollToBottom]);

  // const pendingToolCallConfirmation = agentMessages.some((m: UIMessage) =>
  //   m.parts?.some(
  //     (part) =>
  //       isToolUIPart(part) &&
  //       part.state === "input-available" &&
  //       // Manual check inside the component
  //       toolsRequiringConfirmation.includes(
  //         part.type.replace("tool-", "") as keyof typeof tools
  //       )
  //   )
  // );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // State for managing the current mode
  const [currentMode, setCurrentMode] = useState<"add" | "edit" | "build">(
    "add"
  );

  return (
    <div className="h-[100vh] w-full p-4 flex bg-fixed overflow-hidden">
      <HasOpenAIKey />

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-300 dark:border-neutral-800 flex flex-col shadow-xl">
        <div className="p-4 border-b border-neutral-300 dark:border-neutral-800">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Resume Builder
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            AI-powered resume generator
          </p>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentMode("add")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentMode === "add"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="font-medium">Add Resume Item</span>
              </div>
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                Add experiences, projects, skills
              </p>
            </button>

            <button
              onClick={() => setCurrentMode("edit")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentMode === "edit"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="font-medium">Edit Resume Items</span>
              </div>
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                Modify existing entries
              </p>
            </button>

            <button
              onClick={() => setCurrentMode("build")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                currentMode === "build"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium">Build Resume</span>
              </div>
              <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                Generate tailored resume
              </p>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Theme
            </span>
            <ThemeSelector />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto shadow-xl rounded-md overflow-hidden relative border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {currentMode === "add" && "Add Resume Item"}
                {currentMode === "edit" && "Edit Resume Items"}
                {currentMode === "build" && "Build Resume"}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {currentMode === "add" &&
                  "Add new experiences, projects, and achievements to your resume database"}
                {currentMode === "edit" &&
                  "Modify and update your existing resume items"}
                {currentMode === "build" &&
                  "Generate a tailored resume using AI based on job posting"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentMode === "add" && <AddResumeItemContent />}
          {currentMode === "edit" && <EditResumeItemContent />}
          {currentMode === "build" && <BuildResumeContent />}
        </div>

        {/* Messages */}
        {/* <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 max-h-[calc(100vh-10rem)]">
          {agentMessages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <Card className="p-6 max-w-md mx-auto bg-neutral-100 dark:bg-neutral-900">
                <div className="text-center space-y-4">
                  <div className="bg-[#F48120]/10 text-[#F48120] rounded-full p-3 inline-flex">
                    <Robot size={24} />
                  </div>
                  <h3 className="font-semibold text-lg">Welcome to AI Chat</h3>
                  <p className="text-muted-foreground text-sm">
                    Start a conversation with your AI assistant. Try asking
                    about:
                  </p>
                  <ul className="text-sm text-left space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-[#F48120]">•</span>
                      <span>Weather information for any city</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#F48120]">•</span>
                      <span>Local time in different locations</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          )}

          {agentMessages.map((m, index) => {
            const isUser = m.role === "user";
            const showAvatar =
              index === 0 || agentMessages[index - 1]?.role !== m.role;

            return (
              <div key={m.id}>
                <div
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {showAvatar && !isUser ? (
                      <Avatar username={"AI"} />
                    ) : (
                      !isUser && <div className="w-8" />
                    )}

                    <div>
                      <div>
                        {m.parts?.map((part, i) => {
                          if (part.type === "text") {
                            return (
                              // biome-ignore lint/suspicious/noArrayIndexKey: immutable index
                              <div key={i}>
                                <Card
                                  className={`p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 ${
                                    isUser
                                      ? "rounded-br-none"
                                      : "rounded-bl-none border-assistant-border"
                                  } ${
                                    part.text.startsWith("scheduled message")
                                      ? "border-accent/50"
                                      : ""
                                  } relative`}
                                >
                                  {part.text.startsWith(
                                    "scheduled message"
                                  ) && (
                                    <span className="absolute -top-3 -left-2 text-base">
                                      🕒
                                    </span>
                                  )}
                                  <MemoizedMarkdown
                                    id={`${m.id}-${i}`}
                                    content={part.text.replace(
                                      /^scheduled message: /,
                                      ""
                                    )}
                                  />
                                </Card>
                                <p
                                  className={`text-xs text-muted-foreground mt-1 ${
                                    isUser ? "text-right" : "text-left"
                                  }`}
                                >
                                  {formatTime(
                                    m.metadata?.createdAt
                                      ? new Date(m.metadata.createdAt)
                                      : new Date()
                                  )}
                                </p>
                              </div>
                            );
                          }

                          if (isToolUIPart(part)) {
                            const toolCallId = part.toolCallId;
                            const toolName = part.type.replace("tool-", "");
                            const needsConfirmation =
                              toolsRequiringConfirmation.includes(
                                toolName as keyof typeof tools
                              );

                            // Skip rendering the card in debug mode

                            return (
                              <ToolInvocationCard
                                // biome-ignore lint/suspicious/noArrayIndexKey: using index is safe here as the array is static
                                key={`${toolCallId}-${i}`}
                                toolUIPart={part}
                                toolCallId={toolCallId}
                                needsConfirmation={needsConfirmation}
                                onSubmit={({ toolCallId, result }) => {
                                  addToolResult({
                                    tool: part.type.replace("tool-", ""),
                                    toolCallId,
                                    output: result
                                  });
                                }}
                                addToolResult={(toolCallId, result) => {
                                  addToolResult({
                                    tool: part.type.replace("tool-", ""),
                                    toolCallId,
                                    output: result
                                  });
                                }}
                              />
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div> */}

        {/* Input Area */}
        {/* <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAgentSubmit(e, {
              annotations: {
                hello: "world"
              }
            });
            setTextareaHeight("auto"); // Reset height after submission
          }}
          className="p-3 bg-neutral-50 absolute bottom-0 left-0 right-0 z-10 border-t border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Textarea
                disabled={pendingToolCallConfirmation}
                placeholder={
                  pendingToolCallConfirmation
                    ? "Please respond to the tool confirmation above..."
                    : "Send a message..."
                }
                className="flex w-full border border-neutral-200 dark:border-neutral-700 px-3 py-2  ring-offset-background placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base pb-10 dark:bg-neutral-900"
                value={agentInput}
                onChange={(e) => {
                  handleAgentInputChange(e);
                  // Auto-resize the textarea
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  setTextareaHeight(`${e.target.scrollHeight}px`);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing
                  ) {
                    e.preventDefault();
                    handleAgentSubmit(e as unknown as React.FormEvent);
                    setTextareaHeight("auto"); // Reset height on Enter submission
                  }
                }}
                rows={2}
                style={{ height: textareaHeight }}
              />
              <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
                {status === "submitted" || status === "streaming" ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800"
                    aria-label="Stop generation"
                  >
                    <Stop size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full p-1.5 h-fit border border-neutral-200 dark:border-neutral-800"
                    disabled={pendingToolCallConfirmation || !agentInput.trim()}
                    aria-label="Send message"
                  >
                    <PaperPlaneTilt size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form> */}
      </div>
    </div>
  );
}

const hasOpenAiKeyPromise = fetch("/check-ai-key").then((res) =>
  res.json<{ success: boolean }>()
);

function HasOpenAIKey() {
  const hasOpenAiKey = use(hasOpenAiKeyPromise);

  if (!hasOpenAiKey.success) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500/10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-red-200 dark:border-red-900 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-labelledby="warningIcon"
                >
                  <title id="warningIcon">Warning Icon</title>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                  AI Service Not Available
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-1">
                  The AI service is currently not available. This application
                  uses Cloudflare Workers AI, which should be automatically
                  available.
                </p>
                <p className="text-neutral-600 dark:text-neutral-300">
                  If this error persists, please check that your Cloudflare
                  Worker has the AI binding properly configured in{" "}
                  <code className="bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded text-red-600 dark:text-red-400 font-mono text-sm">
                    wrangler.jsonc
                  </code>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
