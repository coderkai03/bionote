import { google } from "@ai-sdk/google";
import { streamText, CoreMessage } from "ai";

export const runtime = "edge";
export const maxDuration = 60;

interface ChatRequest {
  messages: CoreMessage[];
  data?: {
    imageUrl?: string;
  };
}

interface ImageContent {
  type: "image";
  image: string | URL;
}

interface TextContent {
  type: "text";
  text: string;
}

type MessageContent =
  | TextContent
  | ImageContent
  | (TextContent | ImageContent)[];

export async function POST(req: Request) {
  console.log("--- CHAT API (V3) REQUEST RECEIVED ---");

  try {
    const { messages, data }: ChatRequest = await req.json();

    console.log(`Received ${messages.length} messages.`);
    console.log("Request data:", data);
    if (data?.imageUrl) {
      console.log(`Image URL received, length: ${data.imageUrl.length} characters`);
      console.log(`Image type: ${data.imageUrl.startsWith('data:') ? 'base64' : 'URL'}`);
    }

    // Validate API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Google API key not configured");
      return new Response("Google API key not configured", { status: 500 });
    }

    // Process messages with image support
    const processedMessages = processMessagesWithImages(messages, data);

    console.log("Calling Google Gemini 2.5 Flash API...");
    const result = await streamText({
      model: google("gemini-2.5-flash-preview-04-17", {
        useSearchGrounding: true,
      }),
      messages: processedMessages,
    });

    console.log("API call successful, returning stream response.");
    return result.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("--- CHAT API ERROR ---");
    return handleApiError(error);
  }
}

function processMessagesWithImages(
  messages: CoreMessage[],
  data?: { imageUrl?: string }
): CoreMessage[] {
  if (!data?.imageUrl) {
    return messages;
  }

  const processedMessages = [...messages];
  const lastUserMessage = processedMessages[processedMessages.length - 1];

  // Only process if the last message is from the user
  if (lastUserMessage?.role === "user") {
    const textContent =
      typeof lastUserMessage.content === "string"
        ? lastUserMessage.content
        : "";

    // Create multimodal content array
    const multiModalContent: MessageContent = [
      {
        type: "text",
        text: textContent,
      },
      {
        type: "image",
        image: data.imageUrl.startsWith("data:")
          ? data.imageUrl
          : new URL(data.imageUrl),
      },
    ];

    lastUserMessage.content = multiModalContent;
  }

  return processedMessages;
}

function handleApiError(error: unknown): Response {
  if (error instanceof Error) {
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    return new Response(`Internal Server Error: ${error.message}`, {
      status: 500,
    });
  }

  console.error("Unknown error:", error);
  return new Response("Internal Server Error", { status: 500 });
}
