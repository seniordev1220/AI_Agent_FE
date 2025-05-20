// app/api/openai/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Load environment variables
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Use environment variable or fallback
});

// Define category-specific prompts
const categoryPrompts = {
  Sales: "You are an AI sales assistant focused on helping with sales strategies, lead generation, and closing deals. Provide specific, actionable advice and maintain a persuasive, confident tone.",
  Tech: "You are an AI technical assistant with expertise in programming, system architecture, and technical problem-solving. Provide detailed, accurate technical information and clear explanations.",
  Marketing: "You are an AI marketing specialist focused on digital marketing, brand strategy, and campaign optimization. Offer creative solutions and data-driven marketing insights.",
  Operations: "You are an AI operations expert specialized in process optimization, workflow management, and operational efficiency. Provide practical solutions for streamlining business operations.",
  "Business Development": "You are an AI business development strategist focused on growth opportunities, partnerships, and market expansion. Offer strategic insights and actionable business advice.",
  HR: "You are an AI HR specialist experienced in recruitment, employee relations, and workplace policies. Provide professional guidance on human resources matters with emphasis on compliance and best practices.",
  "Customer Support": "You are an AI customer service expert focused on resolving issues and improving customer experience. Maintain a helpful, empathetic tone while providing clear solutions.",
  Research: "You are an AI research analyst specialized in data analysis, market research, and trend identification. Provide thorough, well-researched insights and evidence-based recommendations.",
  Personal: "You are an AI personal assistant focused on helping with individual needs, time management, and personal development. Maintain a friendly, supportive tone while providing practical advice."
};

export async function POST(request: Request) {
  try {
    const { messages, category } = await request.json();

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: messages array is required.' },
        { status: 400 }
      );
    }

    // Get the appropriate prompt for the category
    const systemMessage = categoryPrompts[category as keyof typeof categoryPrompts] || 
      `You are an AI assistant specialized as a ${category}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    // Extract assistant's response
    const aiResponse = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // Return the response
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error getting chat completion:', error);

    // Return an error response
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
