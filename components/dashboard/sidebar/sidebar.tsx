// components/dashboard/sidebar/Sidebar.tsx
"use client"
import { useState, useEffect } from "react";
import { SidebarSection } from "./sidebarSection";
import { SidebarNavList } from "./sidebarNavList";
import { sidebarNav } from "./sidebarData";
import { Logo } from "@/components/ui/logo";
import { Menu } from "lucide-react"; // Remove X icon import

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Handle window resize and check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical mobile breakpoint
      setIsOpen(window.innerWidth >= 768);
    };

    // Check on mount
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <>
      {/* Mobile Menu Toggle Button - Only show hamburger menu */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-gray-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'fixed top-0 left-0 h-full pt-16' : 'sticky top-0 h-screen'} 
          w-64 bg-white border-r flex flex-col z-40
          transition-transform duration-300 ease-in-out
          ${className || ''}
        `}
      >
        <div className="flex flex-col min-h-full">
          <SidebarSection className="flex-shrink-0">
            <Logo />
            <button 
              className="w-full mt-4 mb-2 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold text-base flex items-center justify-center"
              onClick={() => console.log("New Chat")}
            >
              + New Chat
            </button>
          </SidebarSection>
          <nav className="flex-1 overflow-y-auto">
            <SidebarNavList items={sidebarNav} />
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}