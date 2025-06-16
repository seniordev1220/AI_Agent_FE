"use client"
import { Box, Typography, Button, ToggleButton, ToggleButtonGroup, Card, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import { useState, useEffect } from 'react'
import { CircularProgress } from '@mui/material'
import { useSession } from "next-auth/react"
import { PricePlan } from '@/app/types/price-plan'

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
  const { data: session } = useSession()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual')
  const [loadingAction, setLoadingAction] = useState<{
    type: 'select' | 'add_seats' | null;
    planType: 'individual' | 'standard' | 'smb' | null;
  }>({ type: null, planType: null })
  const [openSeatsDialog, setOpenSeatsDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [additionalSeats, setAdditionalSeats] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPricePlans = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/price-plans`, {
          headers: {
            'Authorization': `Bearer ${session?.user?.accessToken}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch price plans');
        }

        const pricePlans: PricePlan[] = await response.json();
        
        // Transform API price plans to match our UI format
        const transformedPlans: Plan[] = pricePlans
          .filter(plan => plan.is_active)
          .map(plan => ({
            name: plan.name,
            price: billingPeriod === 'annual' ? parseFloat(plan.annual_price) : parseFloat(plan.monthly_price),
            seats: plan.included_seats,
            seatPrice: parseFloat(plan.additional_seat_price),
            planType: plan.plan_type,
            features: plan.features.map(feature => ({
              text: feature.description,
              bold: [] // We'll keep this empty as we don't have bold text info from API
            }))
          }));

        // Add the enterprise plan which is not in the database
        transformedPlans.push({
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
        });

        setPlans(transformedPlans);
      } catch (error) {
        console.error('Error fetching price plans:', error);
        setError(error instanceof Error ? error.message : 'Failed to load price plans');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.accessToken) {
      fetchPricePlans();
    }
  }, [session?.user?.accessToken, billingPeriod]);

  // Add useEffect to check for session ID in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const status = urlParams.get('status');

    if (sessionId && status === 'success') {
      retrieveCheckoutSession(sessionId);
    }
  }, []);

  const retrieveCheckoutSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/retrieve-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          session_id: sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to retrieve checkout session');
      }

      const data = await response.json();
      
      // Handle successful subscription
      if (data.session.payment_status === 'paid') {
        // You can add additional UI feedback here
        console.log('Payment successful:', data);
      }
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      setError(error instanceof Error ? error.message : 'Failed to verify payment status');
    }
  };

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
    setError(null);
    const actionType = totalSeats ? 'add_seats' : 'select';
    try {
      setLoadingAction({ type: actionType, planType });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        credentials: 'include',
        body: JSON.stringify({
          plan_type: planType,
          billing_interval: billingPeriod,
          seats: totalSeats || 1,
          success_url: `${window.location.origin}/payment/success`,
          cancel_url: `${window.location.origin}/dashboard/billing`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create checkout session');
      }

      const { url, sessionId } = await response.json();
      
      localStorage.setItem('checkoutSessionId', sessionId);
      
      window.location.href = url;
    } catch (error) {
      console.error('Error during checkout:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoadingAction({ type: null, planType: null });
    }
  };

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
      
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#FEE2E2', borderRadius: 1 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : (
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
      )}

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
