"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface ChatHistory {
  id: string
  name: string
  timestamp: string
  agentId: string  // Added agentId to track which agent the chat belongs to
}

export default function ChatHistoryPage() {
  const router = useRouter()
  const [chatLogs, setChatLogs] = useState<ChatHistory[]>([])
  const [selectedChats, setSelectedChats] = useState<string[]>([])

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const loadChatHistory = () => {
      const storedHistory = localStorage.getItem('chathistory')
      if (storedHistory) {
        setChatLogs(JSON.parse(storedHistory))
      } else {
        // Initialize with sample data if nothing exists
        const initialChats: ChatHistory[] = [
          {
            id: "1",
            name: "Sales leads for hubspot",
            timestamp: "9/24/2024, 11:37:30 AM",
            agentId: "sales-agent"
          },
          {
            id: "2",
            name: "Recipe generator for lunch ideas",
            timestamp: "9/24/2024, 11:37:29 AM",
            agentId: "recipe-agent"
          },
          {
            id: "3",
            name: "Competitor analysis report",
            timestamp: "9/24/2024, 11:37:28 AM",
            agentId: "analysis-agent"
          }
        ]
        localStorage.setItem('chathistory', JSON.stringify(initialChats))
        setChatLogs(initialChats)
      }
    }

    loadChatHistory()
  }, [])

  // Update localStorage whenever chatLogs changes
  useEffect(() => {
    localStorage.setItem('chathistory', JSON.stringify(chatLogs))
  }, [chatLogs])

  // Helper function to add new chat to history
  const addChatToHistory = (newChat: ChatHistory) => {
    setChatLogs(prevLogs => {
      const updatedLogs = [newChat, ...prevLogs]
      localStorage.setItem('chathistory', JSON.stringify(updatedLogs))
      return updatedLogs
    })
  }

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

  // Handle chat item click
  const handleChatClick = (id: string, e: React.MouseEvent) => {
    // Prevent navigation when clicking checkbox
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return
    }
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
            <div className="flex items-center gap-2">
              <span>Date</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 3.5v8M4.5 8.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {chatLogs.map((chat) => (
            <div 
              key={chat.id}
              className="flex items-center justify-between py-2 px-4 hover:bg-white rounded-lg cursor-pointer"
              onClick={(e) => handleChatClick(chat.id, e)}
            >
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={selectedChats.includes(chat.id)}
                  onChange={() => handleSelect(chat.id)}
                />
                <span>{chat.name}</span>
              </div>
              <span className="text-gray-500">{chat.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
