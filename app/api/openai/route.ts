// app/api/openai/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { StreamingTextResponse, OpenAIStream } from 'ai';

// Load environment variables
require('dotenv').config();

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, instruction } = await req.json();

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: messages array is required.' }), 
        { status: 400 }
      );
    }

    // Create chat completion with streaming
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
      stream: true,
    });

    // Transform the response into a readable stream
    const stream = OpenAIStream(response);

    // Return the stream with the appropriate headers
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred during the request.' }), 
      { status: 500 }
    );
  }
}