import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";
export const maxDuration = 60;

interface CoreMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ImageGenerationRequest {
  messages: CoreMessage[];
  data?: {
    imageUrl?: string;
  };
}

export async function POST(req: NextRequest) {
  console.log("--- IMAGE GENERATION API REQUEST RECEIVED ---");

  try {
    const body: ImageGenerationRequest = await req.json();
    const { messages, data } = body;

    console.log(`Received ${messages.length} messages for image generation.`);
    console.log("Request data:", data);

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Get the last user message (should start with /image)
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 }
      );
    }

    // Extract prompt from the message (remove /image prefix)
    const prompt = lastMessage.content.replace(/^\/image\s*/, "").trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided after /image command" },
        { status: 400 }
      );
    }

    console.log("Image generation prompt:", prompt);
    console.log("Has image attachment:", !!data?.imageUrl);

    if (data?.imageUrl) {
      // If there's an image attachment, use image editing
      console.log("Using image editing with attachment");

      // Convert base64 to buffer for OpenAI
      const base64Data = data.imageUrl.replace(
        /^data:image\/[a-z]+;base64,/,
        ""
      );
      const imageBuffer = Buffer.from(base64Data, "base64");

      // Create a File-like object from the buffer
      const imageFile = new File([imageBuffer], "input.png", {
        type: "image/png",
      });

      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: prompt,
        size: "1024x1024",
      });
      const image_base64 = response.data?.[0]?.b64_json;
      if (!image_base64) {
        console.error("No image data received from OpenAI");
        return NextResponse.json(
          { error: "Failed to edit image" },
          { status: 500 }
        );
      }

      console.log("Image edited successfully");

      // Return the image as base64 data URL
      const imageDataUrl = `data:image/png;base64,${image_base64}`;

      return NextResponse.json({
        imageUrl: imageDataUrl,
        prompt: prompt,
      });
    }
  } catch (error: unknown) {
    console.error("--- IMAGE GENERATION API ERROR ---");
    console.error("Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Image operation failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
