import { SignInForm } from "@/components/sign-in-form"

export default function SignIn() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <SignInForm />
      </div>
    </main>
  )
}
