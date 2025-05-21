import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';

// Update the type and initialization
let pinecone: Pinecone;

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Initialize Pinecone client on first request
    if (!pinecone) {
      pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });
    }

    const { agentId, content } = await req.json();

    if (!content || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get embeddings for the content
    const contentEmbedding = await embeddings.embedQuery(content);

    // Get the Pinecone index
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // Store the content in Pinecone
    const id = `${agentId}-${Date.now()}`;
    await index.upsert({
      id,
      values: contentEmbedding,
      metadata: {
        agentId,
        content,
        timestamp: new Date().toISOString(),
      },
    });

    // Perform a similarity search to find relevant sources
    const queryResponse = await index.query({
      vector: contentEmbedding,
      topK: 3,
      includeMetadata: true,
      filter: {
          agentId: { $eq: agentId }
        }
    });

    // Format the sources
    const sources = queryResponse.matches?.map((match) => ({
      id: match.id,
      title: match.metadata?.title || 'Knowledge Base Entry',
      type: 'text',
      content: match.metadata?.content,
      similarity: match.score,
    })) || [];

    return NextResponse.json({
      success: true,
      sources,
    });

  } catch (error) {
    console.error('Error updating knowledge base:', error);
    return NextResponse.json(
      { error: 'Error updating knowledge base' },
      { status: 500 }
    );
  }
}