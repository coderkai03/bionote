import { google } from '@ai-sdk/google';
import { Message, streamText, CoreMessage } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  console.log('=== CHAT API ROUTE STARTED ===');
  
  try {
    console.log('Parsing request body...');
    const { messages }: { messages: Message[] } = await req.json();
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    console.log('Checking environment variables...');
    console.log('GOOGLE_GENERATIVE_AI_API_KEY exists:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('Google API key not configured');
      return new Response('Google API key not configured', { status: 500 });
    }

    console.log('Processing messages for vision model...');
    const processedMessages = messages.map((message, index) => {
      console.log(`Processing message ${index}:`, {
        role: message.role,
        hasData: !!message.data,
        dataType: typeof message.data,
        contentLength: message.content?.length || 0
      });
      
      if (message.role === 'user' && message.data && typeof message.data === 'object') {
        const data = message.data as { imageUrl?: string };
        console.log('Found image data:', {
          hasImageUrl: !!data.imageUrl,
          imageUrlLength: data.imageUrl?.length || 0,
          imageUrlPrefix: data.imageUrl?.substring(0, 50) + '...'
        });
        
        if (data.imageUrl) {
          console.log('Creating vision message with image...');
          return {
            role: 'user',
            content: [
              { type: 'text', text: message.content },
              { type: 'image', image: new URL(data.imageUrl) }
            ]
          };
        }
      }
      
      console.log('Returning standard message');
      return { role: message.role, content: message.content };
    });

    console.log('Final processed messages:', JSON.stringify(processedMessages, null, 2));

    console.log('Calling Google Gemini API...');
    const result = await streamText({
      model: google('models/gemini-1.5-flash-latest'),
      messages: processedMessages as CoreMessage[],
    });

    console.log('API call successful, returning stream response');
    return result.toDataStreamResponse();
    
  } catch (error: unknown) {
    console.error('=== CHAT API ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    return new Response(`Internal Server Error: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
}
