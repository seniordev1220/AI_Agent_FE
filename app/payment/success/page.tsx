"use client"
import { useEffect, useState } from 'react'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import { useSearchParams, useRouter } from 'next/navigation'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface SessionDetails {
  id: string;
  payment_status: string;
  customer_details?: {
    email?: string;
    name?: string;
  };
  amount_total?: number;
}

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setStatus('error')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/retrieve-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId
          })
        })

        if (!response.ok) {
          throw new Error('Failed to verify session')
        }

        const data = await response.json()
        
        // Check if the payment was successful
        if (data.payment_status === 'paid') {
          setSessionDetails(data)
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('Error verifying session:', error)
        setStatus('error')
      }
    }

    verifySession()
  }, [sessionId])

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6">Verifying your subscription...</Typography>
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: 3,
          p: 2,
        }}
      >
        <Typography variant="h4" color="error">Something went wrong</Typography>
        <Typography variant="body1" textAlign="center">
          We couldn't verify your subscription. Please contact support if you believe this is an error.
        </Typography>
        <Button variant="contained" onClick={handleGoToDashboard}>
          Go to Dashboard
        </Button>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        gap: 3,
        p: 2,
      }}
    >
      <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
      <Typography variant="h4" sx={{ textAlign: 'center' }}>
        Thank you for your subscription!
      </Typography>
      <Box sx={{ textAlign: 'center', maxWidth: 600 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Your payment has been processed successfully. You now have access to all the features included in your plan.
        </Typography>
        {sessionDetails?.customer_details?.email && (
          <Typography variant="body2" color="text.secondary">
            A confirmation email has been sent to {sessionDetails.customer_details.email}
          </Typography>
        )}
        {sessionDetails?.amount_total && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Amount paid: ${(sessionDetails.amount_total / 100).toFixed(2)}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        onClick={handleGoToDashboard}
        sx={{
          mt: 2,
          backgroundColor: '#9FB5F1',
          '&:hover': {
            backgroundColor: '#8CA4E8',
          },
        }}
      >
        Go to Dashboard
      </Button>
    </Box>
  )
} 