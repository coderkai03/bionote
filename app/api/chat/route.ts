import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response("Gemini API key not configured", { status: 500 });
    }

    const result = streamText({
      model: google("gemini-2.5-flash-preview-04-17", {
        useSearchGrounding: true,
      }),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
