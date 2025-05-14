"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ChatHistory {
  id: string
  name: string
  timestamp: string
}

export default function ChatHistoryPage() {
  const [chatLogs, setChatLogs] = useState<ChatHistory[]>([
    {
      id: "1",
      name: "Sales leads for hubspot",
      timestamp: "9/24/2024, 11:37:30 AM"
    },
    {
      id: "2",
      name: "Recipe generator for lunch ideas",
      timestamp: "9/24/2024, 11:37:29 AM"
    },
    {
      id: "3",
      name: "Competitor analysis report",
      timestamp: "9/24/2024, 11:37:28 AM"
    },
    // Add more chat history items as needed
  ])
  
  // Add new state for selected items
  const [selectedChats, setSelectedChats] = useState<string[]>([])

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