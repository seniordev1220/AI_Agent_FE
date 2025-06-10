"use client"
import { Box, Typography, Button, ToggleButton, ToggleButtonGroup, Card, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import { useState } from 'react'
import { CircularProgress } from '@mui/material'

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

type PlanType = 'individual' | 'standard' | 'smb' | 'enterprise';

interface Plan {
  name: string;
  price: number | string;
  seats?: number;
  seatPrice?: number;
  planType: PlanType;
  features: Array<{
    text: string;
    bold: string[];
  }>;
}

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual')
  const [loadingAction, setLoadingAction] = useState<{
    type: 'select' | 'add_seats' | null;
    planType: 'individual' | 'standard' | 'smb' | null;
  }>({ type: null, planType: null })
  const [openSeatsDialog, setOpenSeatsDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [additionalSeats, setAdditionalSeats] = useState(0)

  const handleBillingPeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string | null) => {
    if (newPeriod === 'annually') {
      setBillingPeriod('annual')
    } else if (newPeriod === 'monthly') {
      setBillingPeriod('monthly')
    }
  }

  const handleOpenSeatsDialog = (plan: Plan) => {
    setSelectedPlan(plan)
    setAdditionalSeats(0)
    setOpenSeatsDialog(true)
  }

  const handleCloseSeatsDialog = () => {
    setOpenSeatsDialog(false)
    setSelectedPlan(null)
    setAdditionalSeats(0)
  }

  const handleCheckout = async (planType: 'individual' | 'standard' | 'smb', totalSeats?: number) => {
    const actionType = totalSeats ? 'add_seats' : 'select';
    try {
      setLoadingAction({ type: actionType, planType });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: planType,
          billing_interval: billingPeriod,
          seats: totalSeats || 1,
          success_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/dashboard/billing`
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error during checkout:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoadingAction({ type: null, planType: null });
    }
  };

  const plans: Plan[] = [
    {
      name: 'Individual',
      price: billingPeriod === 'annual' ? 348 : 39,
      seats: 1,
      seatPrice: 7,
      planType: 'individual',
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
      price: billingPeriod === 'annual' ? 888 : 99,
      seats: 2,
      seatPrice: 7,
      planType: 'standard',
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
      price: billingPeriod === 'annual' ? 1416 : 157,
      seats: 3,
      seatPrice: 5,
      planType: 'smb',
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
      planType: 'enterprise',
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
          value={billingPeriod === 'annual' ? 'annually' : 'monthly'}
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
                    {billingPeriod === 'annual' ? ' / year' : ' / month'}
                  </Typography>
                </>
              ) : (
                plan.price
              )}
            </Typography>

            {plan.planType === 'enterprise' ? (
              <ContactSalesButton 
                variant="contained"
                fullWidth
                href="https://tidycal.com/fatima-awan/finiite-ai-demo"
                LinkComponent="a"
                sx={{ textDecoration: 'none' }}
              >
                contact sales
              </ContactSalesButton>
            ) : (
              <SelectButton 
                variant="contained"
                fullWidth
                onClick={() => {
                  if (plan.planType === 'individual' || plan.planType === 'standard' || plan.planType === 'smb') {
                    handleCheckout(plan.planType);
                  }
                }}
                disabled={loadingAction.type === 'select' && loadingAction.planType === plan.planType}
              >
                {loadingAction.type === 'select' && loadingAction.planType === plan.planType ? <CircularProgress size={24} color="inherit" /> : 'Select'}
              </SelectButton>
            )}

            {plan.seats && plan.planType !== 'enterprise' && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {plan.seats} {plan.seats === 1 ? 'seat' : 'seats'} included
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  add more seats at ${plan.seatPrice}/user/month
                </Typography>
                <AddSeatsButton 
                  variant="outlined" 
                  fullWidth 
                  sx={{ mb: 3 }}
                  onClick={() => handleOpenSeatsDialog(plan)}
                  disabled={loadingAction.type === 'add_seats' && loadingAction.planType === plan.planType}
                >
                  {loadingAction.type === 'add_seats' && loadingAction.planType === plan.planType ? <CircularProgress size={24} color="inherit" /> : 'add seats'}
                </AddSeatsButton>
              </>
            )}

            {plan.features.map((feature, index) => (
              <FeatureItem key={index} sx={{ mb: 1 }}>
                <CheckIcon sx={{ color: 'black' }} />
                {renderFeatureText(feature)}
              </FeatureItem>
            ))}
          </PlanCard>
        ))}
      </Box>

      <Dialog open={openSeatsDialog} onClose={handleCloseSeatsDialog}>
        <DialogTitle>Add Seats</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {selectedPlan?.seats} seats included in the base plan.
            Each additional seat costs ${selectedPlan?.seatPrice}/user/month.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Additional Seats"
            type="number"
            fullWidth
            value={additionalSeats}
            onChange={(e) => setAdditionalSeats(Math.max(0, parseInt(e.target.value) || 0))}
            inputProps={{ min: 0 }}
          />
          {additionalSeats > 0 && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Additional cost: ${(additionalSeats * (selectedPlan?.seatPrice || 0)).toFixed(2)}/month
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSeatsDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (selectedPlan && (selectedPlan.planType === 'individual' || selectedPlan.planType === 'standard' || selectedPlan.planType === 'smb')) {
                handleCheckout(selectedPlan.planType, (selectedPlan.seats || 1) + additionalSeats);
                handleCloseSeatsDialog();
              }
            }} 
            variant="contained"
            disabled={loadingAction.type === 'add_seats' && loadingAction.planType === selectedPlan?.planType}
          >
            {loadingAction.type === 'add_seats' && loadingAction.planType === selectedPlan?.planType ? <CircularProgress size={20} /> : 'Proceed to Checkout'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 