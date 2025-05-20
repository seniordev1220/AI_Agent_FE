import { SignInForm } from "@/components/sign-in-form"

export default function SignIn() {
  console.log("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET);
console.log("NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET);
console.log("NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL);
console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY);
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <SignInForm />
      </div>
    </main>
  )
}
