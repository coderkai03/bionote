import { NextRequest, NextResponse } from "next/server";

// Temporarily removing edge runtime due to OpenAI compatibility issues
// export const runtime = "edge";
export const maxDuration = 60;
export const revalidate = 0; // Disable caching for this route
export const dynamic = "force-dynamic"; // Force dynamic rendering

interface ImageEditRequest {
  prompt: string;
  imageUrl: string;
}

export async function POST(req: NextRequest) {
  console.log("--- IMAGE GENERATION API REQUEST RECEIVED ---");

  try {
    const body: ImageEditRequest = await req.json();
    const { prompt, imageUrl } = body;

    // Check if prompt is provided
    if (!prompt || prompt.trim() === "") {
      return NextResponse.json(
        { error: "A prompt is required for image editing" },
        { status: 400 },
      );
    }

    // Check if image is provided
    if (!imageUrl || imageUrl.trim() === "") {
      return NextResponse.json(
        { error: "An image is required for image editing" },
        { status: 400 },
      );
    }

    console.log("Image editing prompt:", prompt);
    console.log("Image URL provided:", imageUrl.substring(0, 50) + "...");

    // Convert base64 data URL to buffer if needed
    let imageBuffer: Buffer;
    if (imageUrl.startsWith("data:image/")) {
      // Extract base64 data from data URL
      const base64Data = imageUrl.split(",")[1];
      imageBuffer = Buffer.from(base64Data, "base64");
    } else {
      // Fetch image from URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch the provided image");
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    // Convert buffer to blob for OpenAI API
    const imageBlob = new Blob([imageBuffer], { type: "image/png" });

    // Create FormData for the image file
    const formData = new FormData();
    formData.append("image", imageBlob, "image.png");
    formData.append("model", "gpt-image-1");
    formData.append("prompt", prompt);
    formData.append("n", "1");
    formData.append("size", "1024x1024");

    // Make direct API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(
        errorData.error?.message ||
          `API request failed with status ${response.status}`,
      );
    }

    const result = await response.json();

    // Handle b64_json response from gpt-image-1
    const imageData = result.data?.[0];

    if (!imageData) {
      throw new Error("No image data returned from OpenAI");
    }

    let editedImageUrl: string;

    if (imageData.b64_json) {
      // Convert base64 to data URL for display
      editedImageUrl = `data:image/png;base64,${imageData.b64_json}`;
      console.log("Image edited successfully (b64_json format)");
    } else if (imageData.url) {
      // Fallback to URL if available
      editedImageUrl = imageData.url;
      console.log("Image edited successfully (URL format)");
    } else {
      throw new Error(
        "No valid image data (b64_json or url) returned from OpenAI",
      );
    }

    return NextResponse.json({
      imageUrl: editedImageUrl,
      prompt: prompt,
      success: true,
    });
  } catch (error: unknown) {
    console.error("--- IMAGE GENERATION API ERROR ---");
    console.error("Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Image editing failed: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
