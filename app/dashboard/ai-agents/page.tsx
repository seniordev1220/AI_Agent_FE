"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModelSelector } from "@/components/ai-agents/model-selector"
import { MessageInput } from "@/components/ai-agents/message-input"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  avatar: string
  description: string
  greeting: string
}

export default function AIAgentsPage() {
  const router = useRouter()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    // Load agents from localStorage on component mount
    const loadAgents = () => {
      const storedAgents = localStorage.getItem('myAgents')
      if (storedAgents) {
        setAgents(JSON.parse(storedAgents))
      }
    }

    loadAgents()
  }, [])

  // Function to add new agent
  const addAgent = (newAgent: Agent) => {
    const updatedAgents = [...agents, newAgent]
    setAgents(updatedAgents)
    localStorage.setItem('myAgents', JSON.stringify(updatedAgents))
  }

  // Function to update existing agent
  const updateAgent = (updatedAgent: Agent) => {
    const updatedAgents = agents.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    )
    setAgents(updatedAgents)
    localStorage.setItem('myAgents', JSON.stringify(updatedAgents))
  }

  // Function to delete agent
  const deleteAgent = (agentId: string) => {
    const updatedAgents = agents.filter(agent => agent.id !== agentId)
    setAgents(updatedAgents)
    localStorage.setItem('myAgents', JSON.stringify(updatedAgents))
  }

  const handleAgentClick = (agentId: string) => {
    console.log("Navigating to agent:", agentId)
    router.push(`/dashboard/chat/${agentId}`)
  }

  if (selectedAgent && messages.length > 0) {
    // Show chat interface when there are messages
    return (
      <div className="max-w-10xl mx-auto p-4 md:p-6 space-y-6 mb-32">
        {/* Chat Messages */}
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-4">
              <Image
                src={selectedAgent.avatar}
                alt={selectedAgent.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="bg-gray-100 rounded-lg p-4 max-w-[80%]">
                {message.content.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <MessageInput />
      </div>
    )
  }

  if (selectedAgent) {
    // Show agent profile when first clicked
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-8">
          <ModelSelector />
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <Image
            src={selectedAgent.avatar}
            alt={selectedAgent.name}
            width={120}
            height={120}
            className="rounded-full"
          />
          <h1 className="text-2xl font-semibold">{selectedAgent.name}</h1>
          <p className="text-gray-600 max-w-md">{selectedAgent.description}</p>
          
          <div className="mt-8">
            <p className="text-gray-600">{selectedAgent.greeting}</p>
          </div>
        </div>

        <MessageInput onSend={(message) => {
          setMessages([
            ...messages,
            {
              id: Date.now().toString(),
              content: message,
              role: 'user',
              timestamp: new Date()
            }
          ])
        }} />
      </div>
    )
  }

  // Show agents list
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <ModelSelector />
      </div>

      {/* Main Content */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Your AI workforce</h1>
        <p className="text-gray-500">Choose your assistant to begin.</p>
      </div>

      {/* Agents Grid */}
      <div>
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
                className="flex gap-4 items-start cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                onClick={() => handleAgentClick(agent.id)}
              >
                <Image
                  src={agent.avatar}
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
              No agents found. Create your first agent to get started.
            </div>
          )}
        </div>
      </div>

      {/* Message Input at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4">
        <div className="max-w-6xl mx-auto">
          <MessageInput />
        </div>
      </div>
    </div>
  )
} 