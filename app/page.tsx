import SignUpForm from "@/components/sign-up-form"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <SignUpForm />
      </div>
    </main>
  )
}
