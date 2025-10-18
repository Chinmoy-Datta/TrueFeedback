import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const model = google("gemini-2.0-flash"); // Or try 'gemini-1.5-pro-latest'

export const runtime = "edge";

export async function POST(req:Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
    
    const result = await streamText({
      model,
      prompt
    });

    console.log(result)

    return result.toTextStreamResponse();

  } catch (error:any) {
    // Gemini/Google API error handling
    console.error("An unexpected error occurred:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
