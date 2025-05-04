"use client"
import { useState } from "react"
import { CategorizedAgents } from "@/components/agents/categorized-agents"
import { AgentsSidebar } from "@/components/agents/agents-sidebar"

export default function AgentsPage() {
  const [selectedCategory, setSelectedCategory] = useState("My Agents")
  
  return (
    <div className="flex h-full">
      <AgentsSidebar 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <div className="flex-1 p-6 bg-gray-50">
        <CategorizedAgents selectedCategory={selectedCategory} />
      </div>
    </div>
  )
}
