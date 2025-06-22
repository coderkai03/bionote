import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const runtime = "edge";

async function searchMyModels(keywords: string) {
  const main_word = keywords.split(",")[0];

  const url = `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(
    main_word
  )}&tags=${encodeURIComponent(keywords)}&archives_flavours=false`;
  console.log(url);
  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${process.env.SKETCHFAB_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} - ${await response.text()}`);
    return;
  }

  const data = await response.json();

  const parsed_data = data.results.map(
    (model: {
      name: string;
      uid: string;
      viewerUrl: string;
      embedUrl: string;
    }) => ({
      name: model.name,
      uid: model.uid,
      viewerUrl: model.viewerUrl,
      embedURL: model.embedUrl,
    })
  );

  return parsed_data;
}

export async function POST(req: Request) {
  console.log("=== CHAT API ROUTE STARTED ===");

  try {
    const { user_prompt }: { user_prompt: string } = await req.json();

    console.log("Checking environment variables...");

    if (!process.env.GROQ_API_KEY) {
      console.error("Groq API key not configured");
      return new Response("Groq API key not configured", { status: 500 });
    }

    const prompt = `System Prompt: Assume that every user search prompt is a request to find a 3D model of a specific object or subject.

    You are an AI assistant that transforms user search prompts into optimized keyword phrases specifically for finding 3D models. For each prompt, first identify the main object or subject that the user wants a 3D model of. Only extract up to five keywords that directly and specifically describe the core object, avoiding broader categories, processes, or related systems unless they are essential to identifying the model. Always return the keywords as a list, with each keyword as a separate item, separated by commas. ${user_prompt}`;

    const result = await generateText({
      model: groq("gemma2-9b-it"),
      prompt: prompt,
    });

    const keywords = result.text;

    const search_results = await searchMyModels(keywords);

    console.log(search_results);

    return new Response(JSON.stringify({ keywords, search_results }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    console.error("=== CHAT API ERROR ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    console.error("Full error object:", error);
    return new Response(
      `Internal Server Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { status: 500 }
    );
  }
}
