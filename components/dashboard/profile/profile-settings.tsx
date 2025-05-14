// Location: app/dashboard/profile/profile-settings.tsx
"use client"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChangePasswordModal } from "./change-password-modal"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function ProfileSettings() {
  const { data: session } = useSession()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: session?.user?.email || '',
    first_name: session?.user?.name?.split(' ')[0] || '',
    last_name: session?.user?.name?.split(' ')[1] || '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile')
      }

      toast.success('Your profile has been updated successfully! The changes will be reflected after your next login.')
      router.refresh()
    } catch (error) {
      console.error('Error updating profile:', error)
      if (error instanceof Error && error.message.includes('Email already registered')) {
        toast.error('This email address is already in use. Please try a different one.')
      } else {
        toast.error(error instanceof Error 
          ? error.message 
          : 'There was a problem updating your profile. Please try again later.'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">Profile Settings</h1>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <h2 className="text-xl font-medium">User</h2>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="first_name" className="block text-sm font-medium">
              First Name
            </label>
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="last_name" className="block text-sm font-medium">
              Last Name
            </label>
            <Input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Button
              variant="outline"
              className="w-full md:w-auto text-gray-700"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              change password
            </Button>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  )
}