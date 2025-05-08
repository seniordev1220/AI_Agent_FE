"use client";
import { useState, useRef, useEffect } from "react";
import { ModelSelector } from "@/components/ai-agents/model-selector";
import { MessageInput } from "@/components/ai-agents/message-input";
import React from "react";

interface ChatMessage {
  role: 'user' | 'assistant';
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

export default function ChatPage({ params }: { params: Promise<{ agentId: string }> }) {
  // Unwrap params using React.use()
  const { agentId } = React.use(params);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);

  // Chat container reference for scroll-to-bottom
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load agent data from localStorage
  useEffect(() => {
    const storedAgents = JSON.parse(localStorage.getItem('myAgents') || '[]') as Agent[];
    const currentAgent = storedAgents.find((a) => a.id === agentId);
    if (currentAgent) {
      setAgent(currentAgent);
    }
  }, [agentId]);

  // Scroll to bottom whenever chat history updates
  useEffect(() => {
    const scrollToBottom = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    };
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [chatHistory]);

  const handleSendMessage = async (message: string) => {
    // Add user message to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: message }, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: message },
          ],
          instruction: agent?.instruction,
        }),
      });

      if (!response.ok) throw new Error('Failed to get a response from the server.');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedContent = "";

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value);
          // This logic expects the Vercel AI SDK's OpenAIStream/StreamingTextResponse output
          accumulatedContent += chunk;

          // Update the last assistant message in chat history
          setChatHistory(prev => {
            // Only update the latest assistant message, keep previous messages intact
            const newHistory = [...prev];
            const lastIndex = newHistory.length - 1;
            if (newHistory[lastIndex] && newHistory[lastIndex].role === "assistant") {
              newHistory[lastIndex] = { ...newHistory[lastIndex], content: accumulatedContent };
            }
            return newHistory;
          });
        }
      }
    } catch (error) {
      console.error('Error getting chat completion:', error);
      // Show error in the last assistant message
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastIndex = newHistory.length - 1;
        if (newHistory[lastIndex] && newHistory[lastIndex].role === "assistant") {
          newHistory[lastIndex].content = "An error occurred while processing your request. Please try again later.";
        }
        return newHistory;
      });
    }
  };

  return (
    <div className="h-[87vh] flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header with Model Selector */}
        <div className="sticky top-0 z-10 bg-white pt-4 pb-2 px-4">
          <div className="max-w-[200px]">
            <ModelSelector />
          </div>
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-8 overflow-y-auto flex flex-col gap-6"
        >
          {chatHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <img
                src={agent?.avatar || "/agents/code.svg"}
                alt={agent?.name || "AI Agent"}
                className="w-24 h-24 rounded-full mb-4"
              />
              <h2 className="text-xl font-semibold mb-2">{agent?.name || "AI Agent"}</h2>
              <p className="text-gray-600 text-center mb-2">
                {agent?.description || "Loading agent description..."}
              </p>
              <p className="text-gray-500 text-center max-w-[600px]">
                {agent?.welcomeMessage || "Hello! How can I help you today?"}
              </p>
            </div>
          ) : (
            chatHistory.map((msg, index) =>
              msg.role === 'user' ? (
                <div key={index} className="self-end bg-gray-100 p-4 rounded-2xl max-w-[80%]">
                  <p className="text-gray-800">{msg.content}</p>
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
                      <div className="space-y-4 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Message Input */}
        <div className="sticky bottom-0 z-10 w-full p-6 bg-gray-50">
          <MessageInput onSend={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}