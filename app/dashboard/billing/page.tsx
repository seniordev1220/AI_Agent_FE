"use client"
import { Box, Typography, Button, ToggleButton, ToggleButtonGroup, Card } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { SubscriptionService, SubscriptionResponse } from '@/lib/services/subscription-service'
import { PlanType, PLAN_PRICES } from '@/types/subscription'
import { toast } from 'react-hot-toast'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

function CheckoutForm({ planType, seats, isAnnual, onSuccess }: { 
  planType: PlanType, 
  seats: number, 
  isAnnual: boolean,
  onSuccess: () => void 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(PaymentElement)!,
      });

      if (pmError) {
        throw pmError;
      }

      await SubscriptionService.createSubscription(
        {
          plan_type: planType,
          seats: seats,
        },
        paymentMethod.id,
        isAnnual
      );

      toast.success('Subscription created successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Failed to create subscription');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || processing}
        sx={{ mt: 2 }}
      >
        {processing ? 'Processing...' : 'Subscribe'}
      </Button>
    </form>
  );
}

export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] = useState('annually')
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<{
    type: PlanType;
    seats: number;
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubscription()
  }, [])

  const loadSubscription = async () => {
    try {
      const sub = await SubscriptionService.getCurrentSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Error loading subscription:', error)
      toast.error('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const handleBillingPeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string) => {
    if (newPeriod !== null) {
      setBillingPeriod(newPeriod)
    }
  }

  const handleSelectPlan = (planType: PlanType, seats: number) => {
    setSelectedPlan({ type: planType, seats })
  }

  const handleUpdateSeats = async (newSeats: number) => {
    try {
      await SubscriptionService.updateSubscription({ seats: newSeats })
      await loadSubscription()
      toast.success('Seats updated successfully')
    } catch (error) {
      toast.error('Failed to update seats')
    }
  }

  const handleCancelSubscription = async () => {
    try {
      await SubscriptionService.updateSubscription({ cancel_at_period_end: true })
      await loadSubscription()
      toast.success('Subscription will be cancelled at the end of the billing period')
    } catch (error) {
      toast.error('Failed to cancel subscription')
    }
  }

  const handleResumeSubscription = async () => {
    try {
      await SubscriptionService.updateSubscription({ cancel_at_period_end: false })
      await loadSubscription()
      toast.success('Subscription resumed successfully')
    } catch (error) {
      toast.error('Failed to resume subscription')
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
      
      {loading ? (
        <Typography>Loading...</Typography>
      ) : subscription ? (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">Current Subscription</Typography>
          <Typography>Plan: {subscription.plan_type}</Typography>
          <Typography>Status: {subscription.status}</Typography>
          <Typography>Seats: {subscription.seats}</Typography>
          <Typography>
            Current Period Ends: {new Date(subscription.current_period_end).toLocaleDateString()}
          </Typography>
          {subscription.trial_end && (
            <Typography>
              Trial Ends: {new Date(subscription.trial_end).toLocaleDateString()}
            </Typography>
          )}
          {subscription.cancel_at_period_end ? (
            <>
              <Typography color="error">
                Your subscription will be cancelled at the end of the current period
              </Typography>
              <Button
                variant="contained"
                onClick={handleResumeSubscription}
                sx={{ mt: 2 }}
              >
                Resume Subscription
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelSubscription}
              sx={{ mt: 2 }}
            >
              Cancel Subscription
            </Button>
          )}
        </Box>
      ) : null}

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
            
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
              {plan.name}
            </Typography>
            
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
                href="mailto:sales@finiite.ai"
              >
                contact sales
              </ContactSalesButton>
            ) : (
              <SelectButton 
                variant="contained"
                fullWidth
                onClick={() => handleSelectPlan(
                  PlanType[plan.name.toUpperCase() as keyof typeof PlanType],
                  plan.seats
                )}
              >
                {subscription?.plan_type === plan.name.toUpperCase() ? 'Current Plan' : 'Select'}
              </SelectButton>
            )}

            {plan.seats && subscription?.plan_type === plan.name.toUpperCase() && (
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
                  onClick={() => handleUpdateSeats(subscription.seats + 1)}
                >
                  add seats
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

      {selectedPlan && (
        <Elements stripe={stripePromise}>
          <Box sx={{ 
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            maxWidth: 400,
            width: '100%',
            borderRadius: 2,
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Subscribe to {selectedPlan.type}
            </Typography>
            <CheckoutForm
              planType={selectedPlan.type}
              seats={selectedPlan.seats}
              isAnnual={billingPeriod === 'annually'}
              onSuccess={() => {
                setSelectedPlan(null)
                loadSubscription()
              }}
            />
            <Button
              onClick={() => setSelectedPlan(null)}
              sx={{ mt: 2 }}
            >
              Cancel
            </Button>
          </Box>
        </Elements>
      )}
    </Box>
  )
} 