"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { loadStripe } from '@stripe/stripe-js'
import { SubscriptionService } from '@/lib/services/subscription-service'
import { toast } from 'sonner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      if (!session?.user?.accessToken) return

      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')
      const paymentIntentId = searchParams.get('payment_intent')

      if (!paymentIntentClientSecret || !paymentIntentId) {
        setError('Invalid payment confirmation')
        return
      }

      try {
        const stripe = await stripePromise
        if (!stripe) {
          throw new Error('Failed to load Stripe')
        }

        const { paymentIntent } = await stripe.retrievePaymentIntent(paymentIntentClientSecret)

        if (!paymentIntent) {
          throw new Error('Failed to confirm payment')
        }

        if (paymentIntent.status === 'succeeded') {
          // Create subscription with the confirmed payment
          await SubscriptionService.createSubscription({
            plan_type: paymentIntent.metadata.plan_type,
            seats: parseInt(paymentIntent.metadata.seats),
            payment_method_id: paymentIntent.payment_method as string,
            is_annual: paymentIntent.metadata.is_annual === 'true'
          }, session.user.accessToken)

          toast.success('Subscription created successfully!')
          router.push('/dashboard/billing')
        } else {
          throw new Error('Payment was not successful')
        }
      } catch (err) {
        console.error('Error confirming payment:', err)
        setError(err instanceof Error ? err.message : 'Failed to confirm payment')
        toast.error('Failed to confirm payment')
      }
    }

    handlePaymentConfirmation()
  }, [session, searchParams, router])

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Payment Failed
        </Typography>
        <Typography color="text.secondary">
          {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Typography>
        Confirming your payment...
      </Typography>
    </Box>
  )
} 