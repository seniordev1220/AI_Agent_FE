"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session?.user.accessToken) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch agents first
        const agentsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/agents`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          }
        );
        
        if (!agentsResponse.ok) {
          throw new Error('Failed to fetch agents');
        }
  
        const agents = await agentsResponse.json();
        
        // Create agent name mapping
        const nameMap: Record<string, string> = {};
        agents.forEach((agent: { id: string; name: string }) => {
          nameMap[agent.id] = agent.name;
        });
        setAgentNames(nameMap);

        // Fetch chat history for each agent
        const chatHistoryPromises = agents.map(async (agent: { id: string }) => {
          const historyResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/chat/${agent.id}/history`,
            {
              headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
              },
            }
          );

          if (!historyResponse.ok) {
            throw new Error(`Failed to fetch chat history for agent ${agent.id}`);
          }

          const history = await historyResponse.json();
          return {
            id: agent.id,
            name: nameMap[agent.id],
            timestamp: new Date().toLocaleString(), // You might want to get this from the latest message
            messages: history.messages
          };
        });

        const allChatHistories = await Promise.all(chatHistoryPromises);
        // Filter out agents with no messages
        const nonEmptyChats = allChatHistories.filter(chat => chat.messages && chat.messages.length > 0);
        setChatLogs(nonEmptyChats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [session]);

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

  const stripHtmlTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent || ''
  }

  const handleExport = () => {
    if (selectedChats.length === 0) {
      alert("Please select at least one chat to export")
      return
    }

    // Create CSV content
    const csvRows = ['Agent Name,Timestamp,Role,Message']
    selectedChats.forEach(chatId => {
      const chat = chatLogs.find(c => c.id === chatId)
      if (chat && chat.messages) {
        chat.messages.forEach(message => {
          const agentName = agentNames[chatId] || `Chat ${chatId}`
          // Strip HTML tags and escape commas and quotes in the content
          const plainContent = stripHtmlTags(message.content)
          const sanitizedContent = plainContent.replace(/"/g, '""')
          csvRows.push(`"${agentName}","${chat.timestamp}","${message.role}","${sanitizedContent}"`)
        })
      }
    })

    // Create and download the CSV file
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `chat_history_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-8xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Chat History</h1>
          <p className="text-gray-500">Access old chat logs</p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleExport}
          disabled={selectedChats.length === 0}
        >
          <span>Export</span>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 1.5v8M4.5 6.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 9v3h9V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </div> 

      <div className="bg-[#F8F9FC] rounded-lg p-4">
        <h2 className="text-lg mb-4">All conversations</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading chat history...
          </div>
        ) : chatLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No chat history available
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
} 
