"use client"
import { useState, useEffect } from "react"
import { MessageInput } from "@/components/ai-agents/message-input"
import { ModelSelector } from "@/components/ai-agents/model-selector"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"

// Use the same agents data
const agents = [
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

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  
  // Find the agent based on the URL parameter
  const agent = agents.find(a => a.id === params.agentId)

  // If no agent is found, redirect back to agents page
  useEffect(() => {
    if (!agent) {
      router.push('/dashboard/ai-agents')
    }
  }, [agent, router])

  if (!agent) return null

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <ModelSelector />
        <Button 
          variant="ghost"
          onClick={() => router.push('/dashboard/ai-agents')}
        >
          Back to Agents
        </Button>
      </div>

      <div className="flex flex-col items-center text-center space-y-4">
        <Image
          src={agent.avatar}
          alt={agent.name}
          width={120}
          height={120}
          className="rounded-full"
        />
        <h1 className="text-2xl font-semibold">{agent.name}</h1>
        <p className="text-gray-600 max-w-md">{agent.description}</p>
        
        {messages.length === 0 && (
          <div className="mt-8">
            <p className="text-gray-600">{agent.greeting}</p>
          </div>
        )}
      </div>

      {messages.length > 0 && (
        <div className="space-y-6 mt-8">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-4">
              <Image
                src={agent.avatar}
                alt={agent.name}
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
      )}

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