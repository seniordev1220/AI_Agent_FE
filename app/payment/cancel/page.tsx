"use client"
import { Box, Typography, Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import CancelIcon from '@mui/icons-material/Cancel'

export default function CancelPage() {
  const router = useRouter()

  const handleReturnToBilling = () => {
    router.push('/dashboard/billing')
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
      <CancelIcon sx={{ fontSize: 64, color: 'error.main' }} />
      <Typography variant="h4" sx={{ textAlign: 'center' }}>
        Payment Cancelled
      </Typography>
      <Typography variant="body1" sx={{ textAlign: 'center', maxWidth: 600 }}>
        Your subscription payment was cancelled or not completed. No charges have been made.
        You can try again whenever you're ready.
      </Typography>
      <Button
        variant="contained"
        onClick={handleReturnToBilling}
        sx={{
          mt: 2,
          backgroundColor: '#9FB5F1',
          '&:hover': {
            backgroundColor: '#8CA4E8',
          },
        }}
      >
        Return to Billing
      </Button>
    </Box>
  )
} 