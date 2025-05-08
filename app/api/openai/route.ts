// app/api/openai/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StreamingTextResponse, OpenAIStream } from 'ai';

// Load environment variables
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Use environment variable or fallback
});

export async function POST(request: Request) {
  try {
    const { messages, instruction } = await request.json();

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: messages array is required.' },
        { status: 400 }
      );
    }

    // Create stream from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: instruction || "You are a helpful AI assistant."
        },
        ...messages,
      ],
      temperature: 0.7,
      stream: true, // Enable streaming
    });

    // Convert the response into a friendly stream
    const stream = OpenAIStream(response);

    // Return a StreamingTextResponse, which can be consumed by the client
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error getting chat completion:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}