// Location: types/next-auth.d.ts

import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    accessToken?: string
    firstName?: string
    lastName?: string
    trialStartDate?: string
    isTrialExpired?: boolean
    hasActiveSubscription?: boolean
  }

  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken?: string
      firstName?: string
      lastName?: string
      trialStartDate?: string
      isTrialExpired?: boolean
      hasActiveSubscription?: boolean
    }
  }
}