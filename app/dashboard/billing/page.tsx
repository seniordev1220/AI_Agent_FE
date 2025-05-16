"use client"
import { Box, Typography, Button, ToggleButton, ToggleButtonGroup, Card } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import { useState } from 'react'

const PlanCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}))

const SelectButton = styled(Button)(({ theme }) => ({
  height: 48,
  marginTop: 2,
  marginBottom: 3,
  backgroundColor: '#9FB5F1',
  color: 'white',
  borderRadius: 24,
  '&:hover': {
    backgroundColor: '#8CA4E8',
  },
}))

const ContactSalesButton = styled(Button)(({ theme }) => ({
  height: 48,
  marginTop: 2,
  marginBottom: 10,
  backgroundColor: '#14234B',
  color: 'white',
  borderRadius: 24,
  '&:hover': {
    backgroundColor: '#1A2B5C',
  },
}))

const AddSeatsButton = styled(Button)(({ theme }) => ({
  height: 48,
  border: '1px solid black',
  color: 'black',
  '&:hover': {
    border: '1px solid black',
    backgroundColor: theme.palette.action.hover,
  },
}))

const BestValueLabel = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  padding: '4px 12px',
  borderRadius: 16,
  background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
  color: 'white',
  fontWeight: 500,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
}))

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}))

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: 'white',
  border: '1px solid #E0E0E0',
  borderRadius: 50,
  '& .MuiToggleButton-root': {
    border: 'none',
    padding: '8px 24px',
    color: 'black',
    backgroundColor: 'transparent',
    '&.Mui-selected': {
      backgroundColor: '#14234B',
      color: 'white',
      borderRadius: 50,
      '&:hover': {
        backgroundColor: '#14234B',
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    }
  }
}))

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState('annually')

  const handleBillingPeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string) => {
    if (newPeriod !== null) {
      setBillingPeriod(newPeriod)
    }
  }

  const plans = [
    {
      name: 'Individual',
      price: billingPeriod === 'annually' ? 29 : 39,
      seats: 1,
      seatPrice: 7,
      features: [
        {
          text: 'Connect to AI models including OpenAI, Google Gemini, Anthropic',
          bold: []
        },
        {
          text: '1 AI Agent',
          bold: ['1 AI Agent']
        },
        {
          text: 'Connect your knowledge base with 50 MB of files',
          bold: ['50 MB']
        },
        {
          text: 'Dashboard analytics',
          bold: []
        }
      ]
    },
    {
      name: 'Standard',
      price: billingPeriod === 'annually' ? 74 : 99,
      seats: 2,
      seatPrice: 7,
      features: [
        {
          text: 'Connect to AI models including OpenAI, Google Gemini, Anthropic',
          bold: []
        },
        {
          text: 'Create 10 AI agents and assistants',
          bold: ['10 AI agents']
        },
        {
          text: 'Connect your knowledge base with 1 GB of files',
          bold: ['1 GB']
        },
        {
          text: 'Dashboard analytics',
          bold: []
        },
        {
          text: 'Workflow automations included',
          bold: []
        }
      ]
    },
    {
      name: 'SMB',
      price: billingPeriod === 'annually' ? 118 : 157,
      seats: 3,
      seatPrice: 5,
      features: [
        {
          text: 'Connect to AI models including OpenAI, Google Gemini, Anthropic, OpenSource',
          bold: []
        },
        {
          text: 'Create unlimited AI agents and assistants',
          bold: ['unlimited AI agents']
        },
        {
          text: 'Deploy& integrate agents into your workflows or websites',
          bold: []
        },
        {
          text: 'Connect your knowledge base with 10 GB of files',
          bold: ['10 GB']
        },
        {
          text: 'Dashboard analytics',
          bold: []
        },
        {
          text: 'Workflow automations included',
          bold: []
        }
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom plan',
      features: [
        {
          text: 'Custom solutions tailored for your business.',
          bold: []
        },
        {
          text: 'Unlimited Agentic AI',
          bold: ['Unlimited']
        },
        {
          text: 'Dedicated support',
          bold: []
        },
        {
          text: 'Private cloud / self host',
          bold: []
        },
        {
          text: 'Custom workflow automations',
          bold: []
        }
      ]
    }
  ]

  // Helper function to render text with bold parts
  const renderFeatureText = (feature: { text: string, bold: string[] }) => {
    if (feature.bold.length === 0) return feature.text;

    let parts = feature.text;
    feature.bold.forEach(boldText => {
      parts = parts.replace(boldText, `<strong>${boldText}</strong>`);
    });

    return (
      <Typography variant="body2" 
        dangerouslySetInnerHTML={{ 
          __html: parts 
        }} 
      />
    );
  };

  return (
    <Box sx={{ p: 4, maxWidth: '1800px', margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 1 }}>Billing</Typography>
      
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Plans for Startups to Fortune 500 Enterprises.
        </Typography>

        <StyledToggleButtonGroup
          value={billingPeriod}
          exclusive
          onChange={handleBillingPeriodChange}
        >
          <ToggleButton value="annually">
            Pay annually (save 25%)
          </ToggleButton>
          <ToggleButton value="monthly">
            Monthly
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 3
      }}>
        {plans.map((plan) => (
          <PlanCard key={plan.name} elevation={2}>
            {plan.name === 'SMB' && (
              <BestValueLabel>
                Best value
              </BestValueLabel>
            )}
            
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>{plan.name}</Typography>
            
            <Typography variant="h4" sx={{ mb: 3 }}>
              {typeof plan.price === 'number' ? (
                <>
                  ${plan.price}
                  <Typography component="span" variant="body1" color="text.secondary">
                    {' '}/ month
                  </Typography>
                </>
              ) : (
                plan.price
              )}
            </Typography>

            {plan.name === 'Enterprise' ? (
              <ContactSalesButton 
                variant="contained"
                fullWidth
              >
                contact sales
              </ContactSalesButton>
            ) : (
              <SelectButton 
                variant="contained"
                fullWidth
              >
                Select
              </SelectButton>
            )}

            {plan.seats && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {plan.seats} {plan.seats === 1 ? 'seat' : 'seats'} included
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  add more seats at ${plan.seatPrice}/user/month
                </Typography>
                <AddSeatsButton variant="outlined" fullWidth sx={{ mb: 3 }}>
                  add seats
                </AddSeatsButton>
              </>
            )}

            {plan.features.map((feature, index) => (
              <FeatureItem key={index} sx={{ mb: 1 }}>
                <CheckIcon sx={{ color: 'primary.main' }} />
                {renderFeatureText(feature)}
              </FeatureItem>
            ))}
          </PlanCard>
        ))}
      </Box>
    </Box>
  )
} 