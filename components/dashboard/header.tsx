"use client"
import { UserNav } from "@/components/user-nav"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"

export function Header() {
  const { data: session } = useSession()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile View */}
        {isMobile ? (
          <div className="flex w-full items-center justify-between">
            <a 
              href="https://tidycal.com/fatima-awan/finiite-ai-demo" 
              className="text-blue-600 hover:underline text-sm whitespace-nowrap"
              target="_blank"
            >
              Book a call
            </a>
            <div className="flex items-center gap-2">
              <UserNav />
              <span className="text-gray-600">
                {session?.user?.name?.split(" ")[0] || "Guest"}
              </span>
            </div>
          </div>
        ) : (
          /* Desktop View */
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">Tip:</span>
              <span className="text-gray-600">
                Need help setting up Agents or want Custom Solutions?
                <a href="https://tidycal.com/fatima-awan/finiite-ai-demo" className="text-blue-600 hover:underline ml-1" target="_blank">
                  Book a call with us!
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <UserNav />
              <span className="text-gray-600">
                {session?.user?.name?.split(" ")[0] || "Guest"}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
