// components/dashboard/sidebar/SidebarAgentsSection.tsx
"use client"
import { useState } from "react";
import { SidebarAgentItem } from "./sidebarAgentItem";
import { ChevronDown, ChevronRight, Bot } from "lucide-react";

export function SidebarAgentsSection({ agents }: { agents: { name: string, description: string, avatar: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex items-center w-full px-3 py-2 hover:bg-gray-100 rounded text-[15px] font-medium text-gray-700"
        onClick={() => setOpen(o => !o)}
      >
        <Bot className="w-5 h-5 mr-2" />
        <span>AI Agents</span>
        {open ? <ChevronDown className="ml-auto w-4 h-4" /> : <ChevronRight className="ml-auto w-4 h-4" />}
      </button>
      {open && (
        <div className="pl-8">
          {agents.map(agent => (
            <SidebarAgentItem key={agent.name} {...agent} />
          ))}
        </div>
      )}
    </div>
  );
}