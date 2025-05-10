// app/chat/page.tsx
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

  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);

  // Add ref for chat container
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

    // Scroll immediately
    scrollToBottom();

    // And scroll again after a short delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [chatHistory]);

  const handleSendMessage = async (message: string) => {
    // Add user message to chat history
    const newMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, newMessage]);

    try {
      // Send request to the API route
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: message },
          ],
          instruction: agent?.instruction,
        }),
      });

      // Parse the response
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || 'Failed to get a response from the server.');
      }

      // Extract assistant's response
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: data.response,
      };

      // Add AI response to chat history
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting chat completion:', error);

      // Add error message to chat history
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "An error occurred while processing your request. Please try again later.",
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="h-[87vh] flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header with Model Selector - now fixed at top */}
        <div className="sticky top-0 z-10 bg-white pt-4 pb-2 px-4">
          <div className="max-w-[200px]">
            <ModelSelector />
          </div>
        </div>

        {/* Chat Messages - only this section should scroll */}
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
            // Existing chat history rendering
            chatHistory.map((msg, index) => (
              msg.role === 'user' ? (
                // User Message
                <div key={index} className="self-end bg-gray-100 p-4 rounded-2xl max-w-[80%]">
                  <p className="text-gray-800">{msg.content}</p>
                </div>
              ) : (
                // AI Response
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
            ))
          )}
        </div>

        {/* Message Input - now fixed at bottom */}
        <div className="sticky bottom-0 z-10 w-full p-6 bg-gray-50">
          <MessageInput
            onSend={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}