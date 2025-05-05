"use client"
import { useState } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AIModel {
  id: string
  name: string
  icon: string
}

const aiModels: AIModel[] = [
  {
    id: "gpt-35-turbo",
    name: "GPT 3.5-Turbo",
    icon: "/model_logo/openai-logo.svg"
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    icon: "/model_logo/gpt4-mini-logo.svg"
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    icon: "/model_logo/openai-logo.svg"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "/model_logo/google-logo.svg"
  },
  {
    id: "claude-2",
    name: "Claude 2",
    icon: "/model_logo/anthropic-logo.svg"
  },
  {
    id: "claude-37",
    name: "Claude 3.7",
    icon: "/model_logo/anthropic-logo.svg"
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    icon: "/model_logo/anthropic-logo.svg"
  },
  {
    id: "llama-2",
    name: "Llama 2",
    icon: "/model_logo/meta-logo.svg"
  },
  {
    id: "mistral-7b",
    name: "Mistral 7b",
    icon: "/model_logo/mistral-logo.svg"
  },
]

export function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState(aiModels[1]) // GPT-4o as default

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <Image
            src={selectedModel.icon}
            alt={selectedModel.name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-medium">{selectedModel.name}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-[200px]">
        {aiModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            className="flex items-center gap-2 py-2"
            onClick={() => setSelectedModel(model)}
          >
            <Image
              src={model.icon}
              alt={model.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>{model.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 