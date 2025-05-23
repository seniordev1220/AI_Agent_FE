"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { data: session } = useSession()
  const router = useRouter();

  // Get the user's image, checking both Google and custom auth sources
  const userImage = session?.user?.image || "/placeholder.svg"
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {session?.user ? (
            <img
              src={userImage}
              alt={session.user.name || "User"}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/profile")}>Profile Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button className="w-full cursor-pointer text-left" onClick={() => signOut({ callbackUrl: "/" })}>
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
