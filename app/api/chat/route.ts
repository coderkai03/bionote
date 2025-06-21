import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if OpenAI API key is configured
    if (!process.env.GROQ_API_KEY) {
      return new Response('Groq API key not configured', { status: 500 });
    }

    const result = await streamText({
      model: groq(process.env.GROQ_MODEL || 'llama3-8b-8192'),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 