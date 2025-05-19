"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ChatMessage {
  role: string
  content: string
}

interface ChatHistoryEntry {
  role: string
  content: string
  timestamp?: string
  agentId?: string
}

interface ChatHistory {
  id: string
  name: string
  timestamp: string
  messages?: ChatMessage[]
}

export default function ChatHistoryPage() {
  const router = useRouter()
  const [chatLogs, setChatLogs] = useState<ChatHistory[]>([])
  const [selectedChats, setSelectedChats] = useState<string[]>([])
  const [agentNames, setAgentNames] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get agent names from localStorage
    const myAgents = localStorage.getItem('myAgents')
    if (myAgents) {
      try {
        const parsedAgents = JSON.parse(myAgents)
        const nameMap: Record<string, string> = {}
        parsedAgents.forEach((agent: { id: string; name: string }) => {
          nameMap[agent.id] = agent.name
        })
        setAgentNames(nameMap)
      } catch (error) {
        console.error('Error parsing myAgents:', error)
      }
    }

    // Get chat history from localStorage
    const chatHistory = localStorage.getItem('chathistory')
    if (chatHistory) {
      try {
        const parsedHistory = JSON.parse(chatHistory)
        const formattedLogs = Object.entries(parsedHistory).map(([id, messages]) => ({
          id,
          name: `Chat ${id}`,
          timestamp: new Date().toLocaleString(),
          messages: messages as ChatMessage[]
        }))
        setChatLogs(formattedLogs)
      } catch (error) {
        console.error('Error parsing chat history:', error)
      }
    }
  }, [])

  // Handle select all checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedChats(chatLogs.map(chat => chat.id))
    } else {
      setSelectedChats([])
    }
  }

  // Handle individual checkbox selection
  const handleSelect = (id: string) => {
    setSelectedChats(prev => 
      prev.includes(id) 
        ? prev.filter(chatId => chatId !== id)
        : [...prev, id]
    )
  }

  // Add click handler for chat items
  const handleChatClick = (id: string) => {
    router.push(`/dashboard/chat/${id}`)
  }

  return (
    <div className="max-w-8xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Chat History</h1>
          <p className="text-gray-500">Access old chat logs</p>
        </div>
        <Button variant="outline" className="gap-2">
          <span>Export</span>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 1.5v8M4.5 6.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 9v3h9V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div> 

      <div className="bg-[#F8F9FC] rounded-lg p-4">
        <h2 className="text-lg mb-4">All conversations</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-4 font-medium">
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                className="rounded"
                checked={selectedChats.length === chatLogs.length}
                onChange={handleSelectAll}
              />
              <span>Name</span>
            </div>
            <span>Date</span>
          </div>

          {chatLogs.map((chat) => (
            <div 
              key={chat.id}
              className="flex items-center justify-between py-2 px-4 hover:bg-white rounded-lg cursor-pointer"
              onClick={() => handleChatClick(chat.id)}
            >
              <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={selectedChats.includes(chat.id)}
                  onChange={() => handleSelect(chat.id)}
                />
                <span>{agentNames[chat.id] || `Chat ${chat.id}`}</span>
              </div>
              <span className="text-gray-500">{chat.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
