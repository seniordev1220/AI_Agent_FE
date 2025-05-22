"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CodeIcon, Settings, Plus } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"

interface Agent {
  id: string
  name: string
  description: string
  avatar_base64: string
  category: string
}

interface CategorizedAgentsProps {
  selectedCategory: string
}

export function CategorizedAgents({ selectedCategory }: CategorizedAgentsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [allAgents, setAllAgents] = useState<Agent[]>()

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) throw new Error('Failed to fetch agents')
        const agents = await response.json()
        setAllAgents(agents)
      } catch (error) {
        console.error('Error fetching agents:', error)
        setAllAgents([])
      }
    }
    
    if (session) {
      fetchAgents()
    }
  }, [session]) // Add session as a dependency

  const filteredAgents = allAgents?.filter(agent =>
    selectedCategory === "My Agents"
      ? true  // Show all agents when "My Agents" is selected
      : agent.category === selectedCategory
  ) || []

  if (filteredAgents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-medium text-gray-900">No agents found</h3>
          <p className="text-gray-500">Get started by creating your first agent</p>
          <Button
            className="bg-black text-white hover:bg-gray-800"
            onClick={() => router.push('/dashboard/my-agents/create')}
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Agent
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredAgents.map((agent) => (
        <Card key={agent.id} className="p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start gap-4">
            {agent.avatar_base64 ? (
                <Image
                  src={`data:image/png;base64,${agent.avatar_base64}`}
                  alt={agent.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xl">
                    {agent.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">{agent.name}</h3>
              <p className="text-gray-600 mb-4">{agent.description}</p>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  className="bg-[#0F172A] text-white hover:bg-gray-800"
                  onClick={() => router.push(`/dashboard/chat/${agent.id}`)}
                >
                  open
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => router.push(`/dashboard/integration?agentId=${agent.id}`)}
                >
                  <CodeIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/dashboard/my-agents/create?id=${agent.id}`)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}