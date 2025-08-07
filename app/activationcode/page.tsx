import { ActivationCodeForm } from "@/components/activation-code-form"

export default function ActivationCodePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-[400px]">
        <ActivationCodeForm />
      </div>
    </main>
  )
}
