"use client"
import { useState } from "react"
import { Plus, FileCode, Image as ImageIcon, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MessageInputProps {
  onSend?: (message: string) => void
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    onSend?.(message.trim())
    setMessage("")
  }

  return (
    <div className="fixed bottom-0 left-[240px] right-0">
      <div className="max-w-[1200px] mx-auto px-6 pb-4">
        <form onSubmit={handleSubmit}>
          <div className="bg-[#F8F9FC] rounded-lg p-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="type message.."
              className="bg-[#F8F9FC] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-6 text-sm"
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded-md text-[#8C8CA1]"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded-md text-[#8C8CA1]"
                >
                  <FileCode className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-gray-200 rounded-md text-[#8C8CA1]"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>

              <Button
                type="submit"
                size="icon"
                className="bg-transparent hover:bg-gray-200 text-[#8C8CA1] h-7 w-7"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 