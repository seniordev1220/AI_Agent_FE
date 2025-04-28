"use client"
import { UserNav } from "@/components/user-nav"
import { useSession } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Tip Section */}
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-medium">Tip:</span>
          <span className="text-gray-600">
            Need help setting up Agents or want Custom Solutions?
            <a href="/book-call" className="text-blue-600 hover:underline ml-1">
              Book a call with us!
            </a>
          </span>
        </div>

        {/* Right Section - Profile */}
        <div className="flex items-center gap-2">
          <UserNav />
          <a className="text-gray-600 hover:text-gray-900">
            {session?.user?.name?.split(" ")[0] || "Guest"}
          </a>
        </div>
      </div>
    </header>
  )
}
