import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Use the latest API version
});

// Calculate amount in cents based on plan type and billing period
function calculateAmount(planType: string, isAnnual: boolean): number {
  const monthlyPrices: Record<string, number> = {
    'INDIVIDUAL': 39,
    'STANDARD': 99,
    'SMB': 157
  };

  const annualPrices: Record<string, number> = {
    'INDIVIDUAL': 29,
    'STANDARD': 74,
    'SMB': 118
  };

  const basePrice = isAnnual ? annualPrices[planType] : monthlyPrices[planType];
  
  if (typeof basePrice !== 'number') {
    throw new Error('Invalid plan type');
  }

  // For annual plans, multiply by 12
  const totalAmount = isAnnual ? basePrice * 12 : basePrice;
  
  // Convert to cents
  return Math.round(totalAmount * 100);
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planType, seats, isAnnual } = body;

    // Calculate the amount based on plan and billing period
    const amount = calculateAmount(planType, isAnnual);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        plan_type: planType,
        seats: seats.toString(),
        is_annual: isAnnual.toString()
      }
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 