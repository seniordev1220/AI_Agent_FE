"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function TrialStatusBanner() {
  const { data: session } = useSession()
  const router = useRouter()
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    console.log(session)
    if (session?.user?.trialStartDate) {
      const trialStart = new Date(session.user.trialStartDate)
      const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days in milliseconds
      const today = new Date()
      const days = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      setDaysLeft(days)
    }
  }, [session])

  // Don't show banner if no trial start date or if trial status is not 'active' or 'expired'
  if (!session?.user?.trialStartDate || session?.user?.trial_status == 'active') {
    return null
  }

  // Show expired banner if trial status is 'expired'
  if (session.user.trial_status === 'expired') {
    return (
      <div className="bg-red-500 text-white px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <p>Your trial has expired. Please subscribe to continue using all features.</p>
          <button
            onClick={() => router.push("/dashboard/billing")}
            className="bg-white text-red-500 px-4 py-1 rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    )
  }

  if (daysLeft !== null && daysLeft <= 3) {
    return (
      <div className="bg-yellow-500 text-white px-4 py-2">
        <div className="container mx-auto flex items-center justify-between">
          <p>Your trial expires in {daysLeft} {daysLeft === 1 ? "day" : "days"}. Subscribe now to continue using all features.</p>
          <button
            onClick={() => router.push("/dashboard/billing")}
            className="bg-white text-yellow-500 px-4 py-1 rounded-full text-sm font-medium hover:bg-yellow-50 transition-colors"
          >
            Subscribe Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-500 text-white px-4 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <p>{daysLeft} days left in your trial. Upgrade to continue using all features after the trial.</p>
        <button
          onClick={() => router.push("/dashboard/billing")}
          className="bg-white text-blue-500 px-4 py-1 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  )
} 
