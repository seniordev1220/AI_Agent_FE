"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModelSelector } from "@/components/ai-agents/model-selector"
import { MessageInput } from "@/components/ai-agents/message-input"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  avatar_base64: string
  description: string
  greeting: string
}

export default function AIAgentsPage() {
  const router = useRouter()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return;
    // Load agents from localStorage on component mount
    const loadAgents = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      })
      const data = await response.json()
      console.log(data)
      setAgents(data)
    }

    loadAgents()
  }, [session])

  const stripHtmlTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const handleSendMessage = async (message: string, files?: File[], isImageGeneration?: boolean, imagePrompt?: string) => {
    if (!selectedAgent || !session) {
      toast.error('Please select an agent first');
      return;
    }

    try {
      // Strip HTML tags from the message
      const strippedMessage = stripHtmlTags(message);
      
      const formData = new FormData();
      formData.append('content', strippedMessage);
      formData.append('model', selectedModel);
      
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${selectedAgent.id}/messages`,
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

      // After successful message send, navigate to the chat page
      router.push(`/dashboard/chat/${selectedAgent.id}`);
    } catch (error) {
      console.error("Error in chat completion:", error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    // Focus the message input after selecting an agent
    const messageInput = document.querySelector('[contenteditable="true"]') as HTMLElement;
    if (messageInput) {
      messageInput.focus();
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <ModelSelector 
          value={selectedModel}
          onChange={(model) => setSelectedModel(model)}
        />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Your AI workforce</h1>
        <p className="text-gray-500">Choose your assistant to begin.</p>
      </div>
      <div className="flex flex-col h-[68vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your AI Agents</h2>
          <Button variant="link" className="text-gray-600">
            View all ({agents.length})
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.length > 0 ? (
            agents.map((agent) => (
              <div
                key={agent.id}
                className={`flex gap-4 items-start cursor-pointer p-4 rounded-lg transition-colors ${
                  selectedAgent?.id === agent.id 
                    ? 'bg-blue-50 ring-2 ring-blue-500' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAgentClick(agent)}
              >
                <Image
                  src={`data:image/png;base64,${agent.avatar_base64}`}
                  alt={agent.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-medium mb-1">{agent.name}</h3>
                  <p className="text-gray-600 text-sm">{agent.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No agents found. <a href="/dashboard/my-agents/create" className="text-blue-600 hover:underline">Create</a> your first agent to get started.
            </div>
          )}
        </div>
        <div className="bg-white mt-auto p-4 z-10">
          <div className="mx-auto">
            {selectedAgent ? (
              <div className="mb-2 px-2">
                <p className="text-sm text-blue-600">
                  Chatting with: {selectedAgent.name}
                </p>
              </div>
            ) : null}
            <MessageInput
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
