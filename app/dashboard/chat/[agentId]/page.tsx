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

interface ConnectedSource {
  id: number;
  name: string;
  source_type: string;
  connection_settings?: {
    file_path?: string;
    url?: string;
    file_size?: number;
  };
}

interface ChatMessage {
  id?: number;
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
  created_at?: string;
  updated_at?: string;
  connected_sources?: ConnectedSource[];
  citations?: string[];
  search_results?: SearchResult[];
  choices?: any[];
  raw_content?: string;
  showDataSources?: boolean;
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  avatar_base64?: string;
  description: string;
  welcome_message: string;
  theme?: string;
  position?: string;
  height?: string;
  width?: string;
  vector_sources_ids?: number[];
}

interface HistoryResponse {
  messages: ChatMessage[];
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

        const history = await historyResponse.json() as HistoryResponse;
        // Format the content of each message in the history
        const formattedHistory = history.messages.map((message: ChatMessage) => {
          // Store the raw content
          const raw_content = message.content;
          // Format the content
          const formattedContent = formatContent(message.content, message.id?.toString() || '', message.citations, message.connected_sources);

          return {
            ...message,
            raw_content: raw_content,
            content: formattedContent,
            citations: Array.isArray(message.citations) ? message.citations : [],
            search_results: Array.isArray(message.search_results) ? message.search_results : []
          };
        }) as ChatMessage[];

        setChatHistory(formattedHistory);

        // Set initial connected sources from the last message that has them
        const lastMessageWithSources = [...formattedHistory]
          .reverse()
          .find((message: ChatMessage) => message.connected_sources && message.connected_sources.length > 0);

        if (lastMessageWithSources?.connected_sources) {
          const sources = lastMessageWithSources.connected_sources.map((source) => ({
            id: source.id,
            name: source.name,
            source_type: source.source_type,
            icon: getSourceIcon(source.source_type)
          }));
          console.log("sources", lastMessageWithSources.connected_sources);
          setConnectedSources(sources);
        }

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

  // Change global selectedSourceId to a map of message IDs to selected source IDs
  const [selectedSourcesMap, setSelectedSourcesMap] = useState<Record<string, number>>({});

  // Update the helper function to format the content to include messageId
  const formatContent = (content: string, messageId: string, citations?: string[], connectedSources?: ConnectedSource[]) => {
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
              return line.replace(
                fullMatch,
                `<a href="javascript:void(0)" class="text-blue-600 hover:underline flex items-center gap-1" onclick="window.downloadFile('${process.env.NEXT_PUBLIC_API_URL}/chat/download/${fileId}', '${filename}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Download ${filename}</a>`
              );
            }

            // Format datasource references [source name]
            if (connectedSources?.length) {
              line = line.replace(/\[([^\]]+)\]/g, (match, sourceName) => {
                const source = connectedSources.find(s => s.name === sourceName);
                if (!source) return match;

                // Determine icon based on source type
                let icon;
                if (source.connection_settings?.file_path?.toLowerCase().endsWith('.pdf')) {
                  icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`;
                } else if (source.source_type === 'web_scraper') {
                  icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
                } else {
                  icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
                }

                return `<a href="javascript:void(0)" class="text-blue-600 hover:underline flex items-center gap-1" onclick="window.handleSourceClick(${JSON.stringify(source)})">${icon}[${sourceName}]</a>`;
              });
            }

            // Format citation numbers [n]
            if (citations?.length) {
              line = line.replace(/\[(\d+)\]/g, (match, num) => {
                const index = parseInt(num) - 1;
                if (citations[index]) {
                  return `<a href="${citations[index]}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    [${num}]
                  </a>`;
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
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`);
        }

        // Get the content type
        const contentType = response.headers.get('content-type');

        // Create blob based on content type
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

  // Update the selectSource helper function to handle message-specific selection
  useEffect(() => {
    (window as any).selectSource = (messageId: string, sourceId: number) => {
      setSelectedSourcesMap(prev => ({
        ...prev,
        [messageId]: sourceId
      }));
      // Find and scroll to the source element within the specific message
      const sourceElement = document.querySelector(`[data-message-id="${messageId}"] [data-source-id="${sourceId}"]`);
      if (sourceElement) {
        sourceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };
  }, []);

  // Update the handleSendMessage function
  const handleSendMessage = async (message: string, files?: File[], isImageGeneration?: boolean, imagePrompt?: string, selectedSourceIds?: string[]) => {
    if (!agent || !session) return;

    console.log('ChatPage received selected source IDs:', selectedSourceIds);

    // Strip HTML tags from the message
    const strippedMessage = message.replace(/<[^>]*>/g, '');

    // Check if the message is asking about data sources or information
    const isDataSourceQuery = /data\s*sources?|information|reference|source|documentation/i.test(strippedMessage);

    const formData = new FormData();
    formData.append('content', strippedMessage);
    formData.append('model', selectedModel);

    // Add selected source IDs to the request if they exist
    if (selectedSourceIds && selectedSourceIds.length > 0) {
      formData.append('source_ids', JSON.stringify(selectedSourceIds));
      console.log('Adding source IDs to FormData:', JSON.stringify(selectedSourceIds));
    }

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

      // Format the content and handle download links
      const formattedContent = formatContent(assistantResponse.content, assistantResponse.id?.toString() || '', assistantResponse.citations, assistantResponse.connected_sources);

      // Create the assistant message with all the new fields
      const assistantMessage: ChatMessage = {
        ...assistantResponse,
        content: formattedContent,
        raw_content: assistantResponse.content,
        showDataSources: isDataSourceQuery,
        connected_sources: assistantResponse.connected_sources || [],
        citations: assistantResponse.citations || [],
        search_results: assistantResponse.search_results || [],
        choices: assistantResponse.choices || []
      };

      // Update connected sources if they exist in the response
      if (assistantMessage.connected_sources && assistantMessage.connected_sources.length > 0) {
        const sources = assistantMessage.connected_sources.map((source) => ({
          id: source.id,
          name: source.name,
          source_type: source.source_type,
          icon: getSourceIcon(source.source_type)
        }));
        setConnectedSources(sources);
      }

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

      // Format the content with citations
      const formattedContent = formatContent(searchResult.content, searchResult.id?.toString() || '', searchResult.citations, searchResult.connected_sources);

      // Create the result message with all metadata
      const resultMessage: ChatMessage = {
        ...searchResult,
        role: "assistant",
        content: formattedContent,
        raw_content: searchResult.content,
        model: "sonar",
        attachments: [],
        citations: searchResult.citations || [],
        search_results: searchResult.search_results || [],
        choices: searchResult.choices || []
      };

      setChatHistory(prev => [...prev, resultMessage]);
      toast.success('Web search completed successfully');

    } catch (error) {
      console.error("Error in web search:", error);

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
    const messageId = msg.id?.toString() || `msg-${index}`;

    // Generate a unique key using timestamp or created_at if available
    const getUniqueKey = (prefix: string) => {
      const timestamp = msg.created_at ? new Date(msg.created_at).getTime() : Date.now();
      return `${prefix}-${msg.id || ''}-${timestamp}-${index}`;
    };

    if (msg.role === "user") {
      return (
        <div
          key={getUniqueKey('message')}
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
                <div key={getUniqueKey(`file-${i}`)} className="flex items-center text-sm text-gray-500">
                  <Paperclip className="h-3 w-3 mr-1" />
                  {file.name}
                </div>
              ))}
              {msg.attachments?.map((attachment) => (
                <div key={getUniqueKey(`attachment-${attachment.id}`)} className="flex items-center text-sm text-gray-500">
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
      const hasSearchResults = Array.isArray(msg.search_results) && msg.search_results.length > 0;
      const hasConnectedSources = Array.isArray(msg.connected_sources) && msg.connected_sources.length > 0;
      const shouldShowSources = (msg.model === "sonar" || msg.showDataSources) &&
        (hasSearchResults || hasConnectedSources);

      return (
        <div key={getUniqueKey('message')} className="flex gap-4 max-w-[80%]">
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
                    __html: formatContent(msg.content, messageId, msg.citations, msg.connected_sources)
                  }}
                />
                <div className="text-xs text-gray-500 mt-2">
                  Model: {msg.model}
                </div>
                {hasConnectedSources && (
                  <div className="mt-4 pt-4 border-t border-gray-200" data-message-id={messageId}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Connected Knowledge Sources:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {msg.connected_sources?.map((source) => (
                          <div
                            key={getUniqueKey(`source-${source.id}`)}
                            data-source-id={source.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors duration-200 cursor-pointer ${selectedSourcesMap[messageId] === source.id
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200'
                              }`}
                            onClick={async () => {
                              console.log(source);
                              try {
                                if (source.type === 'web_scraper') {
                                  const response = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/data-sources/${source.id}/content`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${session?.user.accessToken}`,
                                      },
                                    }
                                  );

                                  if (!response.ok) {
                                    throw new Error('Failed to fetch content');
                                  }

                                  const data = await response.json();
                                  if (data.url) {
                                    window.open(data.url, '_blank');
                                  }
                                } else if (source.type === 'file_upload') {
                                  const response = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/data-sources/${source.id}/content`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${session?.user.accessToken}`,
                                      },
                                    }
                                  );

                                  if (!response.ok) {
                                    throw new Error('Failed to fetch file');
                                  }

                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  
                                  // Open in new tab instead of downloading
                                  window.open(url, '_blank');
                                  
                                  // Clean up URL object
                                  setTimeout(() => window.URL.revokeObjectURL(url), 100);
                                } else {
                                  toast.info('Content viewing not supported for this source type');
                                }
                              } catch (error) {
                                console.error('Error viewing source content:', error);
                                toast.error('Failed to view source content');
                              }
                            }}
                          >
                            <div className="relative w-4 h-4">
                              <img
                                src={getSourceIcon(source.source_type)}
                                alt={source.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-sm text-gray-600">{source.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {shouldShowSources && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs flex items-center gap-1 bg-white"
                        data-source-details
                      >
                        <ExternalLink className="h-3 w-3" />
                        More Details
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle>Sources</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-6">
                        {hasSearchResults && (
                          <div>
                            <h4 className="font-medium mb-2">Web Search Results</h4>
                            <div className="space-y-4">
                              {msg.search_results?.map((result, idx) => (
                                <div key={getUniqueKey(`result-${idx}`)} className="border-b border-gray-100 pb-4">
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
            </div>
          </div>
        </div>
      );
    }
  };

  // Add this new state
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>([]);

  // Add this function to get source icon
  const getSourceIcon = (sourceType: string) => {
    const iconMap: { [key: string]: string } = {
      airtable: "/data_icon/airtable.svg",
      dropbox: "/data_icon/dropbox.svg",
      google_drive: "/data_icon/google-drive.svg",
      slack: "/data_icon/slack.svg",
      github: "/data_icon/github.svg",
      one_drive: "/data_icon/onedrive.svg",
      sharepoint: "/data_icon/sharepoint.svg",
      web_scraper: "/data_icon/web.svg",
      snowflake: "/data_icon/snowflake.svg",
      salesforce: "/data_icon/salesforce.svg",
      hubspot: "/data_icon/hubspot.svg"
    };
    return iconMap[sourceType] || "/data_icon/file-icon.svg";
  };

  // Add this new function before the return statement
  const handleSourceClick = async (source: ConnectedSource) => {
    if (!source || !session) return;

    try {
      if (source.source_type === 'web_scraper' && source.connection_settings?.url) {
        // For web sources, open in new tab
        window.open(source.connection_settings.url, '_blank');
      } else if (source.connection_settings?.file_path) {
        // For files (including PDFs), fetch and open the file
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/data-sources/${source.id}/content`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }

        // Create blob from response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Open in new tab
        window.open(url, '_blank');

        // Clean up
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      } else {
        // For other sources, use the original behavior
        setSelectedSourcesMap(prev => ({
          ...prev,
          [source.id]: source.id
        }));
        const sourceElement = document.querySelector(`[data-source-id="${source.id}"]`);
        if (sourceElement) {
          sourceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    } catch (error) {
      console.error('Error handling source click:', error);
      toast.error('Failed to open source');
    }
  };

  // Add handleSourceClick to window object
  useEffect(() => {
    (window as any).handleSourceClick = handleSourceClick;
  }, [session]);

  return (
    <div className="h-[87vh] flex overflow-hidden">
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="sticky top-0 z-10 bg-white pt-4 pb-2 px-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="max-w-[200px]">
              <ModelSelector
                value={selectedModel}
                onChange={handleModelChange}
              />
            </div>
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