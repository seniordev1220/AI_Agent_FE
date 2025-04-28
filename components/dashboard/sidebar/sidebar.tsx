// components/dashboard/sidebar/Sidebar.tsx
"use client"
import { SidebarSection } from "./sidebarSection";
import {SidebarNavList} from "./sidebarNavList";
import { sidebarNav } from "./sidebarData";
import { Logo } from "@/components/ui/logo";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col h-full">
      <SidebarSection>
        <Logo />
        <button 
          className="w-full mt-4 mb-2 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold text-base flex items-center justify-center"
          onClick={() => console.log("New Chat")}
        >
          + New Chat
        </button>
      </SidebarSection>
      <SidebarNavList items={sidebarNav} />
    </aside>
  );
}