"use client"
import { Plus, FileCode, Image as ImageIcon, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface MessageInputProps {
  message: string
  setMessage: (message: string) => void
  onSend?: (message: string) => void
}

export function MessageInput({ message, setMessage, onSend }: MessageInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    
    onSend?.(message.trim())
    setMessage("")
  }

  return (
    <div className="w-full">
      <div className="mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="bg-[#F8F9FC] rounded-lg p-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="type message.."
              className="bg-[#F8F9FC] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-5 text-sm"
            />
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded-md text-[#8C8CA1]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded-md text-[#8C8CA1]"
                >
                  <FileCode className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 rounded-md text-[#8C8CA1]"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                type="submit"
                size="icon"
                className="bg-transparent hover:bg-gray-200 text-[#8C8CA1] h-6 w-6"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 