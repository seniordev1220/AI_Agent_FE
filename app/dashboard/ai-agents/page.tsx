"use client"
import { useState } from "react"
import Image from "next/image"
import { ChevronDown, Plus, Image as ImageIcon, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const agents: Agent[] = [
  {
    id: "1",
    name: "Sales Agent",
    avatar: "/agents/code.svg",
    description: "Enrich leads in Salesforce, help book meetings with prospect information.",
    greeting: "Hello! I'm your go-to expert for reaching out to potential clients, expanding your network, and helping you meet your sales targets. Ready to start?"
  },
  {
    id: "2",
    name: "HR Onboarding Agent",
    avatar: "/agents/code.svg",
    description: "Help with employee onboarding and HR processes.",
    greeting: "Hi there! I'm here to help with all your HR and onboarding needs. What can I assist you with today?"
  },
  {
    id: "3",
    name: "IT Support Agent",
    avatar: "/agents/code.svg",
    description: "Debug code, make product decisions with guidance and best practises.",
    greeting: "Hello! I'm your IT support specialist. How can I help you today?"
  }
]

export default function AIAgentsPage() {
  const router = useRouter()
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const handleAgentClick = (agentId: string) => {
    console.log("Navigating to agent:", agentId)
    router.push(`/dashboard/chat/${agentId}`)
  }

  if (selectedAgent && messages.length > 0) {
    // Show chat interface when there are messages
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 mb-32">
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
                <p>{message.content}</p>
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
        <Button variant="ghost">Profile</Button>
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
            View all (33)
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => (
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
          ))}
        </div>
      </div>
    </div>
  )
} 