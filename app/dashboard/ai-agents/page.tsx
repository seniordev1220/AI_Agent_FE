"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModelSelector } from "@/components/ai-agents/model-selector"
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
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo")
  const [agents, setAgents] = useState<Agent[]>([])
  const [showAllAgents, setShowAllAgents] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return;
    // Load agents from localStorage on component mount
    const loadAgents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        })
        if (!response.ok) {
          throw new Error('Failed to load agents');
        }
        const data = await response.json()
        setAgents(data)
      } catch (error) {
        toast.error('Failed to load agents');
        console.error('Error loading agents:', error);
      }
    }

    loadAgents()
  }, [session])

  const handleAgentClick = async (agent: Agent) => {
    if (!session) {
      toast.error('Please sign in first');
      return;
    }
    
    const chatUrl = `/dashboard/chat/${agent.id}`;
    try {
      await router.replace(chatUrl);
    } catch (navigationError) {
      console.error("Navigation error:", navigationError);
      window.location.href = chatUrl;
    }
  }

  const displayedAgents = showAllAgents ? agents : agents.slice(0, 4)

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
          {agents.length > 4 && (
            <Button 
              variant="link" 
              className="text-gray-600"
              onClick={() => setShowAllAgents(!showAllAgents)}
            >
              {showAllAgents ? `Show less` : `View all (${agents.length})`}
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.length > 0 ? (
            displayedAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex gap-4 items-start cursor-pointer p-4 rounded-lg transition-colors hover:bg-gray-50"
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
      </div>
    </div>
  )
}
