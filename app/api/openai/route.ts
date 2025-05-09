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
    const { messages, name } = await request.json();

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: messages array is required.' },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: name || "You are a helpful AI assistant." // Use the agent's instruction or fallback
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