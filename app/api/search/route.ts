import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  console.log("=== CHAT API ROUTE STARTED ===");

  try {
    const { user_prompt }: { user_prompt: string } = await req.json();

    console.log("Checking environment variables...");

    if (!process.env.GROQ_API_KEY) {
      console.error("Groq API key not configured");
      return new Response("Groq API key not configured", { status: 500 });
    }

    const prompt = `You are an AI assistant that transforms user search prompts into optimized keyword phrases to improve search engine results. For each prompt, first identify the primary subject or object being searched for. Then, extract and generate a concise set of relevant keywords focused on that main object. Return the keywords as a single string, using spaces to separate each keyword (do not use commas or other punctuation). ${user_prompt}`;

    const result = await generateText({
      model: groq("gemma2-9b-it"),
      prompt: prompt,
    });

    console.log("API call successful, returning stream response");
    return new Response(JSON.stringify({ result: result.text }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("=== CHAT API ERROR ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    console.error("Full error object:", error);
    return new Response(
      `Internal Server Error: ${error instanceof Error ? error.message : String(error)}`,
      { status: 500 },
    );
  }
}
