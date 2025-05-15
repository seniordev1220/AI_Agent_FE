"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CodeIcon, Settings, Plus } from "lucide-react"
import Image from "next/image"

interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  category: string
}

interface CategorizedAgentsProps {
  selectedCategory: string
}

export function CategorizedAgents({ selectedCategory }: CategorizedAgentsProps) {
  const router = useRouter()
  const [allAgents, setAllAgents] = useState<Agent[]>()

  useEffect(() => {
    // Get custom agents from localStorage
    let myAgents: Agent[] = []
    try {
      myAgents = JSON.parse(localStorage.getItem("myAgents") || "[]")
      // Fallback for missing fields
      myAgents = myAgents.map((agent) => ({
        id: agent.id || Date.now().toString(),
        name: agent.name || "Untitled Agent",
        description: agent.description || "",
        avatar: agent.avatar || "/agents/code.svg",
        category: agent.category || "My Agents"
      }))
    } catch {
      myAgents = []
    }
    setAllAgents([...myAgents])
  }, [])

  const filteredAgents = allAgents?.filter(agent =>
    selectedCategory === "My Agents"
      ? allAgents
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
            <Image
              src={agent.avatar}
              alt={agent.name}
              width={48}
              height={48}
              className="rounded-full"
            />
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