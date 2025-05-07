// app/api/openai/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Load environment variables
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Use environment variable or fallback
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { messages } = await request.json();

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: messages array is required.' },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Replace with your desired model (e.g., "gpt-3.5-turbo")
      messages: [
        {
          role: "system",
          content: "You are a helpful sales agent who assists with Salesforce leads and booking meetings."
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