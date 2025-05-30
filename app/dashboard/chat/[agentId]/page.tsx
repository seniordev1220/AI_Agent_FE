"use client";
import { useState, useRef, useEffect } from "react";
import { ModelSelector } from "@/components/ai-agents/model-selector";
import { MessageInput } from "@/components/ai-agents/message-input";
import React from "react";
import { useSession } from "next-auth/react";
import toast from 'react-hot-toast';
import { Paperclip, Upload } from 'lucide-react';

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  model: string;
  files?: File[];
  attachments?: {
    id: number;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  imageUrl?: string;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  instruction: string;
  welcomeMessage: string;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo");
  const { data: session } = useSession();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add this ref to store the current chat history
  const chatHistoryRef = useRef<ChatMessage[]>([]);
  
  // Update ref when chat history changes
  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  // Move the download handler useEffect here
  useEffect(() => {
    chatHistory.forEach((msg, index) => {
      const buttonId = `download-btn-${index}`;
      const directButtonId = `${buttonId}-direct`;
      
      [buttonId, directButtonId].forEach(id => {
        const button = document.getElementById(id);
        if (button) {
          button.onclick = () => {
            const imgUrl = button.getAttribute('data-image-url');
            if (imgUrl) {
              const link = document.createElement('a');
              link.href = imgUrl;
              link.download = `generated-image-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          };
        }
      });
    });
  }, [chatHistory]);

  // Resolve the params Promise and set the agentId
  useEffect(() => {
    params.then(({ agentId }) => {
      setAgentId(agentId);
    });
  }, [params]);

  // Load agent and chat history when agentId is available
  useEffect(() => {
    if (!agentId || !session) return;

    const fetchAgentAndHistory = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch agent from API
        const agentResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );

        if (!agentResponse.ok) {
          throw new Error("Failed to fetch agent");
        }

        const currentAgent = await agentResponse.json();
        setAgent(currentAgent);

        // Fetch chat history from API
        const historyResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${agentId}/history`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );

        if (!historyResponse.ok) {
          throw new Error("Failed to fetch chat history");
        }

        const history = await historyResponse.json();
        setChatHistory(history.messages);
      } catch (err) {
        console.error("Error loading agent:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentAndHistory();
  }, [agentId, session]);

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

  const handleSendMessage = async (
    message: string, 
    files?: File[], 
    isImageGeneration?: boolean,
    imagePrompt?: string
  ) => {
    if (!agent || !session) return;
    
    if (isImageGeneration && imagePrompt) {
      try {
        const formData = new FormData();
        formData.append('prompt', imagePrompt);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/${agentId}/generate-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Failed to generate image');
        }

        const data = await response.json();
        
        // Add user prompt to chat history
        const userMessage: ChatMessage = {
          role: "user",
          content: `[Image Generation] ${imagePrompt}`,
          model: "dall-e-3",
        };
        
        // Add AI response with image to chat history
        const aiMessage: ChatMessage = {
          role: "assistant",
          content: "Here's your generated image:",
          model: "dall-e-3",
          imageUrl: data.image_url,
        };

        setChatHistory(prev => [...prev, userMessage, aiMessage]);
        toast.success('Image generated successfully');

      } catch (error) {
        console.error('Error generating image:', error);
        toast.error('Failed to generate image');
      }
      return;
    }

    console.log('Received files in page:', files);
    
    // Remove HTML tags from the message
    const strippedMessage = message.replace(/<[^>]*>/g, '');
    
    const formData = new FormData();
    formData.append('content', strippedMessage);
    formData.append('model', selectedModel);
    formData.append('stream', 'true');
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }

    const newMessage: ChatMessage = { 
      role: "user", 
      content: strippedMessage,
      model: selectedModel,
      files: files || [],
      attachments: []
    };
    const updatedHistory = [...chatHistory, newMessage];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${agentId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Failed to get a response from the server."
        );
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: ChatMessage = {
        role: "assistant",
        content: "",
        model: selectedModel
      };

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Process all complete lines
          buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              try {
                const content = trimmedLine.slice(6);
                if (content !== '[DONE]') {
                  assistantMessage.content += content;
                  setChatHistory([...updatedHistory, { ...assistantMessage }]);
                }
              } catch (e) {
                console.error('Error parsing streaming response:', e);
              }
            }
          }
        }
        
        // Process any remaining content in the buffer
        if (buffer.trim()) {
          const trimmedBuffer = buffer.trim();
          if (trimmedBuffer.startsWith('data: ')) {
            const content = trimmedBuffer.slice(6);
            if (content !== '[DONE]') {
              assistantMessage.content += content;
              setChatHistory([...updatedHistory, { ...assistantMessage }]);
            }
          }
        }
      }

      toast.success('Message sent successfully');

    } catch (error) {
      console.error("Error in chat completion:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "An error occurred while processing your request. Please try again later.",
        model: selectedModel
      };
      setChatHistory([...updatedHistory, errorMessage]);
      
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleModelChange = (model: string) => {
    console.log("Model changed to:", model);
    setSelectedModel(model);
  };

  const handleFileUpload = async (file: File) => {
    if (!agentId || !session) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/${agentId}/knowledge-bases`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to upload file');
      }

      const data = await response.json();
      toast.success('File uploaded successfully');
      setUploadedFile(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    }
  };

  const handleUpdateKnowledge = () => {
    fileInputRef.current?.click();
  };

  // Add a helper function to format the content
  const formatContent = (content: string) => {
    return content
      // Format titles (lines starting with ###)
      .split('\n')
      .map(line => {
        if (line.startsWith('###')) {
          return `<h3 class="text-xl font-bold my-4">${line.replace('###', '').trim()}</h3>`;
        }
        // Format bold text (wrapped in **)
        return line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
      })
      .join('\n');
  };

  const handleImageDownload = (imageUrl: string) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`; // Give a unique name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update the message rendering to include images
  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.role === "user") {
      return (
        <div
          key={index}
          className="self-end bg-gray-100 p-4 rounded-2xl max-w-[60%]"
        >
          <div className="text-gray-800">
            {msg.content}
          </div>
          {((msg.files?.length ?? 0) > 0 || (msg.attachments?.length ?? 0) > 0) && (
            <div className="mt-2 space-y-1">
              {msg.files?.map((file, i) => (
                <div key={`file-${i}`} className="flex items-center text-sm text-gray-500">
                  <Paperclip className="h-3 w-3 mr-1" />
                  {file.name}
                </div>
              ))}
              {msg.attachments?.map((attachment) => (
                <div key={`attachment-${attachment.id}`} className="flex items-center text-sm text-gray-500">
                  <Paperclip className="h-3 w-3 mr-1" />
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {attachment.name}
                  </a>
                </div>
              ))}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-2">
            Model: {msg.model}
          </div>
        </div>
      );
    } else {
      return (
        <div key={index} className="flex gap-4 max-w-[60%]">
          <img
            src={agent?.avatar_url || "/agents/code.svg"}
            alt={agent?.name || "AI Agent"}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-medium mb-2">{agent?.name || "AI Agent"}</p>
            <div className="bg-gray-50 p-6 rounded-2xl rounded-tl-sm">
              <div className="space-y-4">
                <div
                  className="prose prose-sm whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(
                      /!\[Generated Image\]\((.*?)\)/g,
                      '<img src="$1" alt="Generated Image" class="w-32 h-32 object-cover rounded-lg mt-4" />'
                    )
                  }}
                />
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Generated image"
                    className="w-32 h-32 object-cover rounded-lg mt-4"
                  />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Model: {msg.model}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-[87vh] flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="sticky top-0 z-10 bg-white pt-4 pb-2 px-4">
          <div className="max-w-[200px]">
            <ModelSelector 
              value={selectedModel}
              onChange={handleModelChange}
            />
          </div>
        </div>

        <div
          ref={chatContainerRef}
          className="flex-1 p-8 overflow-y-auto flex flex-col gap-6"
        >
          <div className="flex flex-col items-center justify-center mb-8">
            <img
              src={`data:image/png;base64,${agent?.avatar_base64}` || "/agents/code.svg"}
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
              {agent?.welcome_message || "Hello! How can I help you today?"}
            </p>
          </div>

          {chatHistory.map((msg, index) => renderMessage(msg, index))}
        </div>

        <div className="sticky bottom-0 z-10 w-full p-6 bg-gray-50">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <MessageInput onSend={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
        accept=".txt,.pdf,.doc,.docx"
      />
    </div>
  );
}