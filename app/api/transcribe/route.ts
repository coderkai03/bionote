import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Make sure to set the GOOGLE_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    console.log("Received form data:", formData);
    const file = formData.get("audio") as File | null;
    console.log("Received file:", file);

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // The Gemini API requires a Buffer, so we convert the file.
    const buffer = await file.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    // Using gemini-2.5-flash-lite, but you can use other models that support audio
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const contents = [
      {
        text: "TRANSCRIBE THE CURRENT AUDIO WORD FOR WORD WITHOUT SAYING ANYTHING.",
      },
      {
        inlineData: {
          mimeType: file.type,
          data: base64Audio,
        },
      },
    ];

    const result = await model.generateContent(contents);
    const response = result.response;
    const transcript = response.text();

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Error in transcription API:", error);
    // It's good practice to not expose detailed error messages to the client
    return NextResponse.json(
      { error: "An internal server error occurred during transcription." },
      { status: 500 }
    );
  }
}
