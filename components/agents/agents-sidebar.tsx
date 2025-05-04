"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface AgentsSidebarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  "My Agents",
  "Sales",
  "Tech",
  "Marketing",
  "Operations",
  "Business Development",
  "HR",
  "Customer Support",
  "Research",
  "Personal",
]

export function AgentsSidebar({ selectedCategory, onCategoryChange }: AgentsSidebarProps) {
  const router = useRouter()

  return (
    <div className="w-64 p-4 space-y-6">
      <Button
        className="w-full bg-black text-white hover:bg-gray-800"
        onClick={() => router.push('/dashboard/my-agents/create')}
      >
        <Plus className="mr-2 h-4 w-4" /> Create New Agent
      </Button>

      <div className="space-y-2">
        {categories.map((category, index) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              index === 0 ? 'text-lg font-medium' : 'text-gray-700'
            } ${selectedCategory === category ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
} 