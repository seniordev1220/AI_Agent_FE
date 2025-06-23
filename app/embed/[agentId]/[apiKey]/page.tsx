"use client"

import { useEffect, useState } from 'react'
import { use } from 'react'
import { ChatInterface } from '@/components/ai-agents/chat-interface'
import { Toaster } from 'sonner'

interface Agent {
  id: string
  name: string
  description: string
  welcome_message: string
  avatar: string
  avatar_base64: string
  theme?: string
  position?: string
  height?: string
  width?: string
}

interface PageProps {
  params: Promise<{
    agentId: string
    apiKey: string
  }>
}

export default function EmbedPage({ params }: PageProps) {
  // Unwrap the params Promise
  const resolvedParams = use(params)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        // Use the embed endpoint format
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/embed/${resolvedParams.agentId}/${resolvedParams.apiKey}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch agent data')
        }

        const data = await response.json()
        setAgent(data.agent)
      } catch (err) {
        setError('Failed to load agent data')
        console.error('Error fetching agent data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgentData()
  }, [resolvedParams.agentId, resolvedParams.apiKey])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="h-screen bg-white">
        <ChatInterface
          agent={agent}
          isEmbedded={true}
          apiKey={resolvedParams.apiKey}
        />
      </div>
    </>
  )
} 
