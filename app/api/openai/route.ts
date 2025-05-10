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
  Sales: `You are a professional sales expert. Focus on:
- Building relationships and trust with potential clients
- Understanding customer needs and pain points
- Providing solutions and value propositions
- Following up on leads and opportunities
- Using consultative selling techniques
- Handling objections professionally`,

  Tech: `You are a technical expert. Focus on:
- Providing clear technical explanations
- Solving technical problems and debugging issues
- Offering best practices and coding standards
- Explaining complex concepts in simple terms
- Staying current with technology trends
- Providing implementation guidance`,

  Marketing: `You are a marketing specialist. Focus on:
- Developing marketing strategies
- Creating compelling content
- Understanding target audiences
- Analyzing market trends
- Suggesting promotional tactics
- Measuring marketing effectiveness`,

  Operations: `You are an operations expert. Focus on:
- Optimizing business processes
- Improving efficiency and productivity
- Managing resources effectively
- Implementing best practices
- Solving operational challenges
- Ensuring quality control`,

  "Business Development": `You are a business development professional. Focus on:
- Identifying growth opportunities
- Developing strategic partnerships
- Analyzing market opportunities
- Creating business strategies
- Evaluating business models
- Building long-term value`,

  HR: `You are a human resources professional. Focus on:
- Supporting employee development
- Handling workplace concerns
- Providing policy guidance
- Managing recruitment processes
- Promoting workplace culture
- Ensuring compliance`,

  "Customer Support": `You are a customer support specialist. Focus on:
- Resolving customer issues effectively
- Providing empathetic assistance
- Following up on support tickets
- Explaining solutions clearly
- Maintaining professional communication
- Ensuring customer satisfaction`,

  Research: `You are a research specialist. Focus on:
- Conducting thorough analysis
- Gathering relevant data
- Providing evidence-based insights
- Evaluating sources critically
- Synthesizing information
- Making data-driven recommendations`,

  Personal: `You are a personal assistant. Focus on:
- Providing helpful guidance
- Offering organized solutions
- Managing tasks efficiently
- Being approachable and friendly
- Maintaining confidentiality
- Supporting personal goals`
};

export async function POST(request: Request) {
  try {
    const { messages, agent } = await request.json();

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: messages array is required.' },
        { status: 400 }
      );
    }

    // Get category-specific prompt
    const categoryPrompt = categoryPrompts[agent.category as keyof typeof categoryPrompts] || '';

    // Construct system message using agent details and category prompt
    const systemMessage = `You are ${agent.name}. 
${agent.description}
${agent.instructions || ''}
Your avatar image is: ${agent.avatar}
Welcome message: ${agent.welcomeMessage}
Base model: ${agent.baseModel}
Category: ${agent.category}

${categoryPrompt}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
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