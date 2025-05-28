import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Upload } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { ModelSelector } from '@/components/ai-agents/model-selector'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  model?: string
}

interface Agent {
  id: string
  name: string
  welcomeMessage?: string
  avatar?: string
  description?: string
  avatar_base64?: string
}

interface ChatInterfaceProps {
  agent: Agent | null
  isEmbedded?: boolean
}

export function ChatInterface({ agent, isEmbedded = false }: ChatInterfaceProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedModel, setSelectedModel] = useState<string>("gpt-3.5-turbo")
  const [showUpload, setShowUpload] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Add welcome message if provided
    console.log(agent, isEmbedded)
    if (agent?.welcomeMessage) {
      setMessages([{ role: 'assistant', content: agent.welcomeMessage }])
    }
  }, [agent])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !agent || !session) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      model: selectedModel
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/${agent.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          content: input,
          model: selectedModel
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || data.content,
        model: selectedModel
      }])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send message. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        model: selectedModel
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleModelChange = (model: string) => {
    setSelectedModel(model)
  }

  const handleFileUpload = async (file: File) => {
    if (!agent || !session) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/agents/${agent.id}/knowledge-bases/upload`,
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
            <ModelSelector
              value={selectedModel}
              onChange={handleModelChange}
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
            {agent?.welcomeMessage || "Hello! How can I help you today?"}
          </p>
        </div>

        {/* Chat Messages */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'user' ? (
              <div className="bg-gray-100 p-4 rounded-2xl max-w-[80%]">
                <p className="text-gray-800">{message.content}</p>
                <div className="text-xs text-gray-500 mt-2">
                  Model: {message.model}
                </div>
              </div>
            ) : (
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
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      Model: {message.model}
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    {uploadedFile && (
                      <div className="flex items-center gap-2 mr-2 text-sm text-gray-600">
                        <Upload className="w-4 h-4" />
                        {uploadedFile.name}
                      </div>
                    )}
                    <button
                      className="px-4 py-2 bg-[#9FB5F1] text-white rounded-md hover:bg-[#8CA1E0] transition-colors text-sm"
                      onClick={handleUpdateKnowledge}
                    >
                      Update knowledge base
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Add hidden file input */}
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
        accept=".txt,.pdf,.doc,.docx"  // Add more file types as needed
      />
    </div>
  )
} 