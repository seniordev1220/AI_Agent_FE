"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AIModel {
  ai_model_name: string
  provider: string
  logo_path: string
  is_enabled: boolean
  is_default: boolean
}

interface ModelsResponse {
  default_model: string
  models: AIModel[]
  open_sourced_models: AIModel[]
}

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { data: session } = useSession()
  const [models, setModels] = useState<AIModel[]>([])
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchModels = async () => {
      if (!session?.user.accessToken) return

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch models')
        }

        const data: ModelsResponse = await response.json()
        const enabledModels = [...data.models, ...data.open_sourced_models]
          .filter(model => model.is_enabled)

        setModels(enabledModels)

        // Find the model that matches the current value or use default
        const currentModel = enabledModels.find(
          model => model.ai_model_name === value
        ) || enabledModels.find(
          model => model.ai_model_name === data.default_model
        ) || enabledModels[0]
        
        setSelectedModel(currentModel)
        // Notify parent of initial model selection if different from value
        if (currentModel && currentModel.ai_model_name !== value) {
          onChange(currentModel.ai_model_name)
        }
      } catch (error) {
        console.error('Error fetching models:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [session, value, onChange])

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model)
    onChange(model.ai_model_name)
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <div className="h-8 w-8 animate-pulse bg-gray-200 rounded-full" />
        <div className="h-4 w-24 animate-pulse bg-gray-200 rounded" />
      </div>
    )
  }

  if (!selectedModel || models.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <Image
            src={selectedModel.logo_path}
            alt={selectedModel.ai_model_name}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="font-medium">{selectedModel.ai_model_name}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-[200px]">
        {models.map((model) => (
          <DropdownMenuItem
            key={model.ai_model_name}
            className="flex items-center gap-2 py-2"
            onClick={() => handleModelSelect(model)}
          >
            <Image
              src={model.logo_path}
              alt={model.ai_model_name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>{model.ai_model_name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 