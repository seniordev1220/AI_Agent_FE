"use client";
import { useState, useRef, useEffect } from "react";
import { ModelSelector } from "@/components/ai-agents/model-selector";
import { MessageInput } from "@/components/ai-agents/message-input";
import React from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  instruction: string;
  welcomeMessage: string;
}

interface DataSource {
  id: string;
  title: string;
  url?: string;
  type: 'pdf' | 'webpage' | 'text';
}

interface ChatMessageWithSources extends ChatMessage {
  sources?: DataSource[];
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessageWithSources[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null); // State to store resolved agentId

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Resolve the params Promise and set the agentId
  useEffect(() => {
    params.then(({ agentId }) => {
      setAgentId(agentId);
    });
  }, [params]);

  // Load agent and chat history when agentId is available
  useEffect(() => {
    if (!agentId) return;

    const storedAgents = JSON.parse(
      localStorage.getItem("myAgents") || "[]"
    ) as Agent[];
    const currentAgent = storedAgents.find((a) => a.id === agentId);
    if (currentAgent) {
      setAgent(currentAgent);

      // Get all chat histories from localStorage
      const allChatHistories = JSON.parse(
        localStorage.getItem("chathistory") || "{}"
      );
      
      // Get specific agent's chat history or initialize empty array
      const agentChatHistory = allChatHistories[agentId] || [];
      setChatHistory(agentChatHistory);
    }
  }, [agentId]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (agentId && chatHistory.length > 0) {
      // Get current chat histories
      const allChatHistories = JSON.parse(
        localStorage.getItem("chathistory") || "{}"
      );
      
      // Update the specific agent's chat history
      allChatHistories[agentId] = chatHistory;
      
      // Save back to localStorage
      localStorage.setItem("chathistory", JSON.stringify(allChatHistories));
    }
  }, [chatHistory, agentId]);

  // Log current chat history state for debugging
  useEffect(() => {
    console.log("Current chat history state:", chatHistory);
  }, [chatHistory]);

  // Scroll to the bottom of the chat container when chat history changes
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    };

    scrollToBottom();

    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [chatHistory]);

  const handleSendMessage = async (message: string) => {
    const newMessage: ChatMessage = { role: "user", content: message };

    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            ...chatHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: message },
          ],
          instruction: agent?.instruction,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            data.error ||
            "Failed to get a response from the server."
        );
      }

      const aiResponse: ChatMessage = {
        role: "assistant",
        content: data.response,
      };

      const finalHistory = [...updatedHistory, aiResponse];
      setChatHistory(finalHistory);
      
      // Update localStorage with new chat history
      const allChatHistories = JSON.parse(
        localStorage.getItem("chathistory") || "{}"
      );
      allChatHistories[agentId!] = finalHistory;
      localStorage.setItem("chathistory", JSON.stringify(allChatHistories));
    } catch (error) {
      console.error("Error getting chat completion:", error);

      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "An error occurred while processing your request. Please try again later.",
      };

      const finalHistory = [...updatedHistory, errorMessage];
      setChatHistory(finalHistory);
      
      // Update localStorage with error message
      const allChatHistories = JSON.parse(
        localStorage.getItem("chathistory") || "{}"
      );
      allChatHistories[agentId!] = finalHistory;
      localStorage.setItem("chathistory", JSON.stringify(allChatHistories));
    }
  };

  const handleUpdateKnowledgeBase = async (messageIndex: number) => {
    const message = chatHistory[messageIndex];
    if (!message || !agentId) return;

    try {
      const response = await fetch('/api/update-knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          content: message.content,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Update the message with sources
      const updatedHistory = [...chatHistory];
      updatedHistory[messageIndex] = {
        ...message,
        sources: data.sources,
      };
      setChatHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to update knowledge base:', error);
      alert('Failed to update knowledge base. Please try again.');
    }
  };

  return (
    <div className="h-[87vh] flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="sticky top-0 z-10 bg-white pt-4 pb-2 px-4">
          <div className="max-w-[200px]">
            <ModelSelector />
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 p-8 overflow-y-auto flex flex-col gap-6"
        >
          <div className="flex flex-col items-center justify-center mb-8">
            <img
              src={agent?.avatar || "/agents/code.svg"}
              alt={agent?.name || "AI Agent"}
              className="w-24 h-24 rounded-full mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">
              {agent?.name || "AI Agent"}
            </h2>
            <p className="text-gray-600 text-center mb-2">
              {agent?.description || "Loading agent description..."}
            </p>
            <p className="text-gray-500 text-center max-w-[600px]">
              {agent?.welcomeMessage || "Hello! How can I help you today?"}
            </p>
          </div>

          {chatHistory.map((msg, index) =>
            msg.role === "user" ? (
              <div
                key={index}
                className="self-end bg-gray-100 p-4 rounded-2xl max-w-[80%]"
              >
                <div
                  className="text-gray-800 prose prose-img:my-0 prose-img:max-w-full prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              </div>
            ) : (
              <div key={index} className="flex gap-4 max-w-[80%]">
                <img
                  src={agent?.avatar || "/agents/code.svg"}
                  alt={agent?.name || "AI Agent"}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium mb-2">{agent?.name || "AI Agent"}</p>
                  <div className="bg-gray-50 p-6 rounded-2xl rounded-tl-sm">
                    <div
                      className="space-y-4 whitespace-pre-wrap prose prose-img:my-0 prose-img:max-w-full prose-img:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: msg.content }}
                    />
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Sources:</p>
                        <ul className="list-disc pl-4">
                          {msg.sources.map((source, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              {source.title}
                              {source.url && (
                                <a href={source.url} target="_blank" rel="noopener noreferrer" 
                                   className="ml-2 text-blue-500 hover:underline">
                                  (link)
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end mt-2 ml-auto">
                    <button
                      className="px-4 py-2 bg-[#9FB5F1] text-white rounded-md hover:bg-[#8CA1E0] transition-colors text-sm"
                      onClick={() => handleUpdateKnowledgeBase(index)}
                    >
                      Update knowledge base
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="sticky bottom-0 z-10 w-full p-6 bg-gray-50">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <MessageInput onSend={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
