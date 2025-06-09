"use client"
import { Box, Typography, Button, ToggleButton, ToggleButtonGroup, Card, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SubscriptionService, SubscriptionResponse, SubscriptionCreate } from '@/lib/services/subscription-service'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Styled Components
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

const PaymentDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 500,
    padding: theme.spacing(2),
  },
}))

const PaymentButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  height: 48,
  backgroundColor: '#14234B',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1A2B5C',
  },
  '&.Mui-disabled': {
    backgroundColor: '#9FB5F1',
    color: 'white',
  },
}))

type PlanType = 'INDIVIDUAL' | 'STANDARD' | 'SMB' | 'ENTERPRISE';

interface Plan {
  name: PlanType;
  price: number | string;
  seats?: number;
  seatPrice?: number;
  features: Array<{
    text: string;
    bold: string[];
  }>;
}

interface PaymentFormProps {
  planType: Exclude<PlanType, 'ENTERPRISE'>;
  seats: number;
  isAnnual: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

// Payment Form Component
function PaymentForm({ planType, seats, isAnnual, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/billing/success`,
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{
        layout: 'tabs',
      }} />
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <PaymentButton
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </PaymentButton>
        <PaymentButton
          type="submit"
          variant="contained"
          disabled={!stripe || !elements || processing}
        >
          {processing ? <CircularProgress size={24} /> : 'Subscribe'}
        </PaymentButton>
      </Box>
    </form>
  );
}

// Main Billing Page Component
export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState('annually');
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      const accessToken = session?.user?.accessToken;
      if (!accessToken || typeof accessToken !== 'string') return;

      try {
        const sub = await SubscriptionService.getCurrentSubscription(accessToken);
        setSubscription(sub);
      } catch (error) {
        console.error('Error loading subscription:', error);
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [session]);

  const handleBillingPeriodChange = (event: React.MouseEvent<HTMLElement>, newPeriod: string) => {
    if (newPeriod !== null) {
      setBillingPeriod(newPeriod);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.name === 'ENTERPRISE') {
      router.push('/contact-sales');
      return;
    }
    setSelectedPlan(plan);
    setSelectedSeats(plan.seats || 1);
    setLoadingPayment(true);
    setPaymentDialogOpen(true);

    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: plan.name,
          seats: plan.seats || 1,
          isAnnual: billingPeriod === 'annually',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
      setPaymentDialogOpen(false);
    } finally {
      setLoadingPayment(false);
    }
  };

  const handleUpdateSeats = async (newSeats: number) => {
    const accessToken = session?.user?.accessToken;
    if (!accessToken || typeof accessToken !== 'string') return;

    try {
      const updatedSub = await SubscriptionService.updateSubscription({
        seats: newSeats,
      }, accessToken);
      setSubscription(updatedSub);
      toast.success('Seats updated successfully!');
    } catch (error) {
      console.error('Error updating seats:', error);
      toast.error('Failed to update seats');
    }
  };

  const handleCancelSubscription = async () => {
    const accessToken = session?.user?.accessToken;
    if (!accessToken || typeof accessToken !== 'string') return;

    try {
      const updatedSub = await SubscriptionService.updateSubscription({
        cancel_at_period_end: true,
      }, accessToken);
      setSubscription(updatedSub);
      toast.success('Subscription will be cancelled at the end of the billing period');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleResumeSubscription = async () => {
    const accessToken = session?.user?.accessToken;
    if (!accessToken || typeof accessToken !== 'string') return;

    try {
      const updatedSub = await SubscriptionService.updateSubscription({
        cancel_at_period_end: false,
      }, accessToken);
      setSubscription(updatedSub);
      toast.success('Subscription resumed successfully!');
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error('Failed to resume subscription');
    }
  };

  const plans: Plan[] = [
    {
      name: 'INDIVIDUAL',
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
      name: 'STANDARD',
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
      name: 'ENTERPRISE',
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
  ];

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
      
      {subscription?.status === 'trialing' && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography>
            You are currently in a trial period that ends on {new Date(subscription.trial_end!).toLocaleDateString()}
          </Typography>
        </Box>
      )}

      {subscription?.cancel_at_period_end && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography>
            Your subscription will be cancelled on {new Date(subscription.current_period_end).toLocaleDateString()}
            <Button
              variant="contained"
              size="small"
              onClick={handleResumeSubscription}
              sx={{ ml: 2 }}
            >
              Resume Subscription
            </Button>
          </Typography>
        </Box>
      )}
      
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

            {subscription && subscription.plan_type === plan.name ? (
              <>
                <Typography variant="body1" sx={{ mb: 2, color: 'success.main' }}>
                  Current Plan
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={handleCancelSubscription}
                  sx={{ mb: 2 }}
                >
                  Cancel Subscription
                </Button>
              </>
            ) : plan.name === 'ENTERPRISE' ? (
              <ContactSalesButton 
                variant="contained"
                fullWidth
                onClick={() => window.open('https://tidycal.com/fatima-awan/finiite-ai-demo', '_blank')}
              >
                Contact Sales
              </ContactSalesButton>
            ) : (
              <SelectButton 
                variant="contained"
                fullWidth
                onClick={() => handleSelectPlan(plan)}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Select'}
              </SelectButton>
            )}

            {plan.seats && (
              <>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {subscription && subscription.plan_type === plan.name
                    ? `${subscription.seats} seats in use`
                    : `${plan.seats} ${plan.seats === 1 ? 'seat' : 'seats'} included`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  add more seats at ${plan.seatPrice}/user/month
                </Typography>
                {subscription && subscription.plan_type === plan.name && (
                  <AddSeatsButton
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 3 }}
                    onClick={() => handleUpdateSeats(subscription.seats + 1)}
                  >
                    Add Seat
                  </AddSeatsButton>
                )}
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

      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => {
          setPaymentDialogOpen(false);
          setClientSecret(null);
        }}
      >
        <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {billingPeriod === 'annually'
              ? `You will be charged $${selectedPlan?.price} annually`
              : `You will be charged $${selectedPlan?.price} monthly`}
          </Typography>
          {loadingPayment ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : selectedPlan && selectedPlan.name !== 'ENTERPRISE' && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#14234B',
                    colorBackground: '#ffffff',
                    colorText: '#14234B',
                    fontFamily: 'Inter, sans-serif',
                  }
                }
              }}
            >
              <PaymentForm
                planType={selectedPlan.name}
                seats={selectedSeats}
                isAnnual={billingPeriod === 'annually'}
                onSuccess={() => {
                  setPaymentDialogOpen(false);
                  setClientSecret(null);
                  const accessToken = session?.user?.accessToken;
                  if (accessToken && typeof accessToken === 'string') {
                    SubscriptionService.getCurrentSubscription(accessToken)
                      .then(setSubscription)
                      .catch(error => {
                        console.error('Error refreshing subscription:', error);
                        toast.error('Failed to refresh subscription details');
                      });
                  }
                }}
                onCancel={() => {
                  setPaymentDialogOpen(false);
                  setClientSecret(null);
                }}
              />
            </Elements>
          ) : null}
        </DialogContent>
      </PaymentDialog>
    </Box>
  );
}

// Helper function to calculate amount in cents
function calculateAmount(price: number | string, isAnnual: boolean, seats: number): number {
  if (typeof price !== 'number') return 0;
  const baseAmount = isAnnual ? price * 12 : price;
  return Math.round(baseAmount * 100); // Convert to cents
}