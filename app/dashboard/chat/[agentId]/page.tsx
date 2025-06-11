"use client";
import { useState, useRef, useEffect } from "react";
import { ModelSelector } from "@/components/ai-agents/model-selector";
import { MessageInput } from "@/components/ai-agents/message-input";
import React from "react";
import { useSession } from "next-auth/react";
import { toast } from 'sonner';
import { Paperclip, Upload, ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface SearchResult {
  title: string;
  url: string;
  date: string;
}

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
  search_results?: SearchResult[];
  citations?: string[];
  raw_content?: string;
  showDataSources?: boolean;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  avatar_base64?: string;
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
        // Format the content of each message in the history
        const formattedHistory = history.messages.map((msg: ChatMessage) => {
          // Store the raw content
          const raw_content = msg.content;
          // Format the content
          const formattedContent = formatContent(msg.content, msg.citations);
          
          return {
            ...msg,
            raw_content: raw_content,
            content: formattedContent,
            citations: Array.isArray(msg.citations) ? msg.citations : [],
            search_results: Array.isArray(msg.search_results) ? msg.search_results : []
          };
        });
        
        setChatHistory(formattedHistory);
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

  // Add the helper function to format the content
  const formatContent = (content: string, citations?: string[]) => {
    if (!content) return '';
    
    // Split content into paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs
      .map(paragraph => {
        // Skip empty paragraphs
        if (!paragraph.trim()) return '';
        
        const lines = paragraph.split('\n');
        return lines
          .map(line => {
            // Format titles (lines starting with ###)
            if (line.startsWith('###')) {
              return `<h3>${line.replace('###', '').trim()}</h3>`;
            }

            // Format bold text (wrapped in **)
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Format download links
            const downloadMatch = line.match(/\[Download ([^\]]+)\](?:\(|\[)([^\)]+)(?:\)|\])/);
            if (downloadMatch) {
              const [fullMatch, filename, url] = downloadMatch;
              const fileIdMatch = url.match(/\/download\/([^\/]+)/);
              const fileId = fileIdMatch ? fileIdMatch[1] : url;
              const downloadApiUrl = `https://app.finiite.com/demo/api/chat/download/${fileId}`;
              return line.replace(
                fullMatch,
                `<a href="javascript:void(0)" class="text-blue-600 hover:underline flex items-center gap-1" onclick="window.downloadFile('${downloadApiUrl}', '${filename}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Download ${filename}</a>`
              );
            }
            
            // Format citation numbers [n]
            if (citations?.length) {
              line = line.replace(/\[(\d+)\]/g, (match, num) => {
                const index = parseInt(num) - 1;
                if (citations[index]) {
                  return `<a href="${citations[index]}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">[${num}]</a>`;
                }
                return match;
              });
            }
            
            return line.trim();
          })
          .filter(line => line.length > 0)
          .join('<br />'); // Join lines within a paragraph with line breaks
      })
      .filter(para => para.length > 0)
      .map(para => `<p>${para}</p>`) // Wrap each paragraph in a <p> tag
      .join(''); // Join paragraphs
  };

  // Add the download file helper function
  useEffect(() => {
    // Add the downloadFile function to the window object
    (window as any).downloadFile = async (url: string, filename: string) => {
      try {
        console.log('Downloading file:', url, filename);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        });
        
        if (!response.ok) {
          console.error('Download failed:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to download file: ${response.statusText}`);
        }
        
        // Check the content type to handle errors that might be returned as JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();
          if (jsonResponse.error) {
            throw new Error(jsonResponse.error);
          }
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success('File downloaded successfully');
      } catch (error) {
        console.error('Error downloading file:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to download file');
      }
    };
  }, [session]);

  // Update the handleSendMessage function
  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!agent || !session) return;
    
    // Strip HTML tags from the message
    const strippedMessage = message.replace(/<[^>]*>/g, '');
    
    // Check if the message is asking about data sources or information
    const isDataSourceQuery = /data\s*sources?|information|reference|source|documentation/i.test(strippedMessage);
    
    const formData = new FormData();
    formData.append('content', strippedMessage);
    formData.append('model', selectedModel);
    
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
      attachments: [],
      showDataSources: isDataSourceQuery
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
        throw new Error(errorData.detail || "Failed to get a response from the server.");
      }

      const assistantResponse = await response.json();
      
      // Store both raw and formatted content
      const assistantMessage: ChatMessage = {
        ...assistantResponse,
        raw_content: assistantResponse.content, // Store the raw content
        content: formatContent(assistantResponse.content), // Store the formatted content
        model: selectedModel,
        showDataSources: isDataSourceQuery // Inherit the showDataSources flag from the user message
      };

      setChatHistory([...updatedHistory, assistantMessage]);
      toast.success('Message sent successfully');

    } catch (error) {
      console.error("Error in chat completion:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "An error occurred while processing your request. Please try again later.",
        model: selectedModel,
        showDataSources: false
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

  const handleImageDownload = (imageUrl: string) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`; // Give a unique name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add web search handler
  const handleWebSearch = async (query: string) => {
    if (!agent || !session) return;

    const strippedQuery = query.replace(/<[^>]*>/g, '');
    const formData = new FormData();
    formData.append('content', strippedQuery);

    const queryMessage: ChatMessage = {
      role: "user",
      content: `[Web Search Query] ${strippedQuery}`,
      model: "sonar",
      attachments: []
    };
    
    setChatHistory([...chatHistory, queryMessage]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${agentId}/web-search`,
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
        throw new Error(errorData.detail || "Failed to perform web search.");
      }

      const searchResult = await response.json();
      
      // Validate the response structure
      if (!searchResult || typeof searchResult !== 'object') {
        throw new Error('Invalid search result format');
      }

      // Extract the content and metadata from the search result with fallbacks
      const resultMessage: ChatMessage = {
        role: "assistant",
        content: searchResult?.ai_response || searchResult?.content || "No response content available",
        model: "sonar",
        attachments: [],
        search_results: searchResult?.search_results || [],
        citations: searchResult?.citations || []
      };

      // Format content for display
      const formattedContent = formatContent(resultMessage.content, resultMessage.citations);
      const displayMessage = {
        ...resultMessage,
        content: formattedContent
      };

      setChatHistory(prev => [...prev, displayMessage]);
      toast.success('Web search completed successfully');

    } catch (error) {
      console.error("Error in web search:", error);
      
      // Add error message to chat history
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while performing the web search. Please try again later.",
        model: "sonar",
        attachments: []
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
      toast.error(error instanceof Error ? error.message : 'Failed to perform web search');
    }
  };

  // Update the message rendering to include images
  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.role === "user") {
      return (
        <div
          key={index}
          className="self-end bg-gray-100 p-4 rounded-2xl max-w-[60%]"
        >
          <div
            className="text-gray-800"
            dangerouslySetInnerHTML={{
              __html: msg.content
            }}
          />
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
      // Show sources button for web search messages or when showDataSources is true
      const shouldShowSources = msg.model === "sonar" || msg.showDataSources;

      return (
        <div key={index} className="flex gap-4 max-w-[80%]">
          <img
            src={`data:image/png;base64,${agent?.avatar_base64}` || "/agents/code.svg"}
            alt={agent?.name || "AI Agent"}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-medium mb-2">{agent?.name || "AI Agent"}</p>
            <div className="bg-gray-50 p-6 rounded-2xl rounded-tl-sm">
              <div className="space-y-4">
                <div
                  className="prose prose-sm max-w-none whitespace-pre-wrap break-words [&>p]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:my-4"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                  }}
                />
                {shouldShowSources && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="mt-2 text-xs flex items-center gap-1 bg-white"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Sources
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle>Sources</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">                        
                        {msg.search_results && msg.search_results.length > 0 && (
                          <div>
                            <div className="space-y-4">
                              {msg.search_results.map((result, idx) => (
                                <div key={`result-${idx}`} className="border-b border-gray-100 pb-4">
                                  <a 
                                    href={result.url} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    {result.title}
                                  </a>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {result.date}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
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
              {agent?.welcomeMessage || "Hello! How can I help you today?"}
            </p>
          </div>

          {chatHistory.map((msg, index) => renderMessage(msg, index))}
        </div>

        <div className="sticky bottom-0 z-10 w-full p-6 bg-gray-50">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <MessageInput 
                onSend={handleSendMessage} 
                onWebSearch={handleWebSearch}
              />
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
