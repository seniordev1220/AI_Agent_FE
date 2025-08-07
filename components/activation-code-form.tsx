"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/ui/logo"
import { toast } from "sonner"

export function ActivationCodeForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    activationCode: "",
    agreedToTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showActivationCode, setShowActivationCode] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenerateCode = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast.error("Please fill in all fields first")
      return
    }

    setIsGenerating(true)
    try {
      // Generate activation code
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activation-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.detail || "Failed to generate activation code"
        throw new Error(errorMessage)
      }

      if (data.activation_code) {
        setFormData(prev => ({
          ...prev,
          activationCode: data.activation_code
        }))
        setShowActivationCode(true)
        toast.success("Activation code generated successfully!")
      }
    } catch (error) {
      console.error('Error generating activation code:', error)
      toast.error(error instanceof Error ? error.message : "Failed to generate activation code")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCheckboxChange = (checked: boolean | string) => {
    setFormData((prev) => ({ ...prev, agreedToTerms: checked === true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.agreedToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy")
      return
    }

    setIsLoading(true)
    try {
      // Sign up request
      const signUpResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup/activation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          activation_code: formData.activationCode,
          provider: "credentials"
        }),
      })

      const data = await signUpResponse.json()

      if (!signUpResponse.ok) {
        const errorMessage = data.detail || 'Failed to sign up'
        
        // Handle specific error cases from FastAPI
        switch (errorMessage) {
          case "Email registration is disabled. Please use SSO.":
            throw new Error("Email registration is disabled. Please use SSO.")
          case "Email already registered":
            throw new Error("This email is already registered. Please sign in instead.")
          case "Activation code is required":
            throw new Error("Please enter your activation code.")
          case "Invalid activation code":
            throw new Error("The activation code you entered is invalid.")
          case "Activation code has already been used":
            throw new Error("This activation code has already been used.")
          case "User information does not match activation code":
            throw new Error("The provided information does not match the activation code.")
          default:
            throw new Error(errorMessage)
        }
      }

      // After successful signup, redirect to dashboard
      // The user will get 10 agents and 1GB storage without trial period
      router.push("/dashboard")
      toast.success("Successfully signed up! You have been granted 10 agents and 1GB storage.")
      
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <Logo />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Build your AI workforce</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input 
              id="firstName" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="space-y-4">
          {!showActivationCode ? (
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500"
              onClick={handleGenerateCode}
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password || isGenerating}
            >
              <span className="flex items-center justify-center gap-2">
                {isGenerating ? "Generating..." : "Generate Activation Code"}
              </span>
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="activationCode">activation code</Label>
              <Input 
                id="activationCode" 
                name="activationCode" 
                value={formData.activationCode} 
                onChange={handleChange} 
                required 
                readOnly
              />
            </div>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={formData.agreedToTerms} 
            onCheckedChange={handleCheckboxChange}
          />
          <Label htmlFor="terms" className="text-sm font-normal leading-none">
            I have read and agree to the{" "}
            <Link 
              href="https://www.finiite.com/terms" 
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms
            </Link>{" "}
            &{" "}
            <Link 
              href="https://www.finiite.com/privacy-policy-services" 
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>{" "}
            by Finiite Technologies Inc.
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500"
          disabled={isLoading}
        >
          <span className="flex items-center justify-center gap-2">
            {isLoading ? "Signing up..." : "start"} <ArrowRight className="h-4 w-4" />
          </span>
        </Button>

        <div className="text-center text-sm">
          Have an account?{" "}
          <Link href="/sign-in" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
