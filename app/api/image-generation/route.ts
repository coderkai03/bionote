import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const image = formData.get("image") as File;
  const caption = formData.get("caption") as string;

  // image is a base64 string
  const response = await openai.images.edit({
    model: "gpt-image-1",
    image: image,
    prompt: caption,
  });
  const image_base64 = response.data?.[0]?.b64_json;
  if (!image_base64) {
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
  const image_bytes = Buffer.from(image_base64, "base64");
  return NextResponse.json({ image_bytes });
}
