import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const trialStartDate = session.user.trialStartDate
    const trialStatus = session.user.trial_status

    if (!trialStartDate) {
      return NextResponse.json(
        { error: "No trial found" },
        { status: 404 }
      )
    }

    const trialStart = new Date(trialStartDate)
    const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days in milliseconds
    const today = new Date()
    const isTrialExpired = today > trialEnd

    // If user's trial status is not 'active' or 'expired', they're not limited
    if (trialStatus && !['active', 'expired'].includes(trialStatus)) {
      return NextResponse.json({
        trial_active: false,
        trial_expired: false,
        trial_status: trialStatus,
        days_left: 0,
        limits: null
      })
    }

    // Trial limits
    const trialLimits = {
      max_agents: 3,
      max_requests_per_day: 100,
      max_tokens_per_request: 2000,
      max_file_size_mb: 10,
      max_files_per_day: 10
    }

    return NextResponse.json({
      trial_active: !isTrialExpired,
      trial_expired: isTrialExpired,
      trial_status: trialStatus,
      days_left: Math.max(0, Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
      limits: trialLimits
    })

  } catch (error) {
    console.error("Error in trial status route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
