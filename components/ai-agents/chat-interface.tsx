import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Upload, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { MessageInput } from '@/components/ai-agents/message-input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ModelSelector } from '@/components/ai-agents/model-selector'
import { EmbedModelSelector } from '@/components/ai-agents/embed-model-selector'

interface SearchResult {
  title: string
  url: string
  date: string
}

interface ConnectedSource {
  id: number
  name: string
  source_type: string
  connection_settings?: {
    file_path?: string
    url?: string
    file_size?: number
  }
}

interface ChatMessage {
  id?: number
  role: 'user' | 'assistant'
  content: string
  model: string
  files?: File[]
  attachments?: {
    id: number
    name: string
    type: string
    url: string
    size: number
  }[]
  created_at?: string
  updated_at?: string
  connected_sources?: ConnectedSource[]
  citations?: string[]
  search_results?: SearchResult[]
  choices?: any[]
  raw_content?: string
  showDataSources?: boolean
}

interface Agent {
  id: string
  name: string
  welcome_message?: string
  avatar?: string
  description?: string
  avatar_base64?: string
  theme?: string
  position?: string
  height?: string
  width?: string
}

interface ChatInterfaceProps {
  agent: Agent | null
  isEmbedded?: boolean
  apiKey?: string
}

export function ChatInterface({ agent, isEmbedded = false, apiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo")
  const [selectedSourcesMap, setSelectedSourcesMap] = useState<Record<string, number>>({})
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>([])

  useEffect(() => {
    if (agent?.welcome_message) {
      setMessages([{ role: 'assistant', content: agent.welcome_message, model: selectedModel }])
    }
  }, [agent])

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    scrollToBottom()
  }, [messages])

  const formatContent = (content: string, messageId: string, citations?: string[], connectedSources?: ConnectedSource[]) => {
    if (!content) return '';

    const paragraphs = content.split('\n\n');

    return paragraphs
      .map(paragraph => {
        if (!paragraph.trim()) return '';

        const lines = paragraph.split('\n');
        return lines
          .map(line => {
            if (line.startsWith('###')) {
              return `<h3>${line.replace('###', '').trim()}</h3>`;
            }

            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            if (connectedSources?.length) {
              line = line.replace(/\[([^\]]+)\]/g, (match, sourceName) => {
                const source = connectedSources.find(s => s.name === sourceName);
                if (!source) return match;

                let icon = getSourceIcon(source.source_type);
                return `<a href="javascript:void(0)" class="text-blue-600 hover:underline flex items-center gap-1" onclick="window.handleSourceClick(${JSON.stringify(source)})">${icon}[${sourceName}]</a>`;
              });
            }

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
          .join('<br />');
      })
      .filter(para => para.length > 0)
      .map(para => `<p>${para}</p>`)
      .join('');
  };

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

  const handleSourceClick = async (source: ConnectedSource) => {
    if (!source) return;

    try {
      if (source.source_type === 'web_scraper' && source.connection_settings?.url) {
        window.open(source.connection_settings.url, '_blank');
      } else if (source.connection_settings?.file_path) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/data-sources/${source.id}/content`,
          {
            headers: {
              'X-API-Key': apiKey || '',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    } catch (error) {
      console.error('Error handling source click:', error);
      toast.error('Failed to open source');
    }
  };

  useEffect(() => {
    (window as any).handleSourceClick = handleSourceClick;
  }, [apiKey]);

  const handleSendMessage = async (message: string, files?: File[], isImageGeneration?: boolean, imagePrompt?: string, selectedSourceIds?: string[]) => {
    if (!agent || !apiKey) return;

    const strippedMessage = message.replace(/<[^>]*>/g, '');
    const isDataSourceQuery = /data\s*sources?|information|reference|source|documentation/i.test(strippedMessage);

    const formData = new FormData();
    formData.append('content', strippedMessage);
    formData.append('model', selectedModel);
    formData.append('api_key', apiKey);

    if (selectedSourceIds && selectedSourceIds.length > 0) {
      formData.append('source_ids', JSON.stringify(selectedSourceIds));
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

    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/embed/${agent.id}/messages`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to get a response from the server.");
      }

      const assistantResponse = await response.json();
      const formattedContent = formatContent(
        assistantResponse.content,
        assistantResponse.id?.toString() || '',
        assistantResponse.citations,
        assistantResponse.connected_sources
      );

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

      if (assistantMessage.connected_sources && assistantMessage.connected_sources.length > 0) {
        setConnectedSources(assistantMessage.connected_sources);
      }

      setMessages(prev => [...prev, assistantMessage]);
      toast.success('Message sent successfully');

    } catch (error) {
      console.error("Error in chat completion:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "An error occurred while processing your request. Please try again later.",
        model: selectedModel,
        showDataSources: false
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleWebSearch = async (query: string) => {
    if (!agent || !apiKey) return;

    const strippedQuery = query.replace(/<[^>]*>/g, '');
    const formData = new FormData();
    formData.append('content', strippedQuery);
    formData.append('api_key', apiKey);

    const queryMessage: ChatMessage = {
      role: "user",
      content: `[Web Search Query] ${strippedQuery}`,
      model: "sonar",
      attachments: []
    };

    setMessages(prev => [...prev, queryMessage]);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/embed/${agent.id}/web-search`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to perform web search.");
      }

      const searchResult = await response.json();
      const formattedContent = formatContent(
        searchResult.content,
        searchResult.id?.toString() || '',
        searchResult.citations,
        searchResult.connected_sources
      );

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

      setMessages(prev => [...prev, resultMessage]);
      toast.success('Web search completed successfully');

    } catch (error) {
      console.error("Error in web search:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error while performing the web search. Please try again later.",
        model: "sonar",
        attachments: []
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error(error instanceof Error ? error.message : 'Failed to perform web search');
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const messageId = msg.id?.toString() || `msg-${index}`;
    const getUniqueKey = (prefix: string) => {
      const timestamp = msg.created_at ? new Date(msg.created_at).getTime() : Date.now();
      return `${prefix}-${msg.id || ''}-${timestamp}-${index}`;
    };

    if (msg.role === "user") {
      return (
        <div
          key={getUniqueKey('message')}
          className="flex justify-end"
        >
          <div className="bg-gray-100 p-4 rounded-2xl max-w-[80%]">
            <p className="text-gray-800">{msg.content}</p>
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
        </div>
      );
    }

    const hasSearchResults = Array.isArray(msg.search_results) && msg.search_results.length > 0;
    const hasConnectedSources = Array.isArray(msg.connected_sources) && msg.connected_sources.length > 0;
    const shouldShowSources = (msg.model === "sonar" || msg.showDataSources) &&
      (hasSearchResults || hasConnectedSources);

    return (
      <div key={getUniqueKey('message')} className="flex justify-start">
        <div className="flex gap-4 max-w-[80%]">
          <div className="w-12 h-12 relative flex-shrink-0">
            <Image
              src={agent?.avatar_base64 ? `data:image/png;base64,${agent.avatar_base64}` : (agent?.avatar || "/agents/code.svg")}
              alt={agent?.name || "AI Agent"}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium mb-2">{agent?.name || "AI Agent"}</p>
            <div className="bg-gray-50 p-6 rounded-2xl rounded-tl-sm">
              <div
                className="space-y-4 whitespace-pre-wrap prose prose-img:my-0 prose-img:max-w-full prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: msg.content }}
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
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors duration-200 cursor-pointer ${
                            selectedSourcesMap[messageId] === source.id
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-white border-gray-200'
                          }`}
                          onClick={() => handleSourceClick(source)}
                        >
                          <div className="relative w-4 h-4">
                            <Image
                              src={getSourceIcon(source.source_type)}
                              alt={source.name}
                              width={16}
                              height={16}
                              className="object-contain"
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
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <Image
              src={agent?.avatar_base64 ? `data:image/png;base64,${agent.avatar_base64}` : (agent?.avatar || "/agents/code.svg")}
              alt={agent?.name || "AI Agent"}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <h2 className="font-medium">{agent?.name || "AI Agent"}</h2>
        </div>
        {isEmbedded && (
          <div className="flex items-center">
            <EmbedModelSelector
              value={selectedModel}
              onChange={handleModelChange}
              apiKey={apiKey || ''}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Agent Info Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-24 h-24 relative mb-4">
            <Image
              src={agent?.avatar_base64 ? `data:image/png;base64,${agent.avatar_base64}` : (agent?.avatar || "/agents/code.svg")}
              alt={agent?.name || "AI Agent"}
              fill
              className="rounded-full object-cover"
            />
          </div>
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

        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <MessageInput
          onSend={handleSendMessage}
          onWebSearch={handleWebSearch}
        />
      </div>
    </div>
  );
} 
