import { NextRequest, NextResponse } from "next/server";

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
      // If there's an image attachment, use demo image editing
      console.log("Using demo image editing with attachment");

      // For demo purposes, we'll fetch the public image and convert it to base64
      const imageUrl = `${req.nextUrl.origin}/image.png`;

      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(
            `Failed to fetch demo image: ${imageResponse.status}`
          );
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const base64String = Buffer.from(imageBuffer).toString("base64");

        console.log("Demo image loaded successfully");

        // Return the image as base64 data URL
        const imageDataUrl = `data:image/png;base64,${base64String}`;
        setTimeout(() => {
          console.log("Demo image processing complete");
        }, 15000); // Simulate processing delay
        return NextResponse.json({
          imageUrl: imageDataUrl,
          prompt: prompt,
          demoMode: true,
          message: "These are the labelled parts of the image.",
        });
      } catch (fetchError) {
        console.error("Failed to fetch demo image:", fetchError);
        return NextResponse.json(
          { error: "Failed to load demo image" },
          { status: 500 }
        );
      }
    } else {
      // If no image attachment, also return demo image for now
      console.log("Using demo image generation without attachment");

      const imageUrl = `${req.nextUrl.origin}/image.png`;

      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(
            `Failed to fetch demo image: ${imageResponse.status}`
          );
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const base64String = Buffer.from(imageBuffer).toString("base64");

        console.log("Demo image generated successfully");

        // Return the image as base64 data URL
        const imageDataUrl = `data:image/png;base64,${base64String}`;

        return NextResponse.json({
          imageUrl: imageDataUrl,
          prompt: prompt,
          demoMode: true,
          message: "Demo mode: Using sample image from /public/image.png",
        });
      } catch (fetchError) {
        console.error("Failed to fetch demo image:", fetchError);
        return NextResponse.json(
          { error: "Failed to load demo image" },
          { status: 500 }
        );
      }
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
