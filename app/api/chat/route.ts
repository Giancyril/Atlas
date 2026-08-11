import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatRequest, ChatResponse, AnalyzeErrorResponse } from "@/types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { repoFullName, commitSha, analysisData, messages, question } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "Please enter a valid question", code: "INVALID_URL" } satisfies AnalyzeErrorResponse,
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const systemPrompt = `You are an expert AI software architect assisting a developer in understanding the GitHub repository "${repoFullName}" (commit ${commitSha}).

You have access to the repository's structured analysis context below:

=== REPOSITORY OVERVIEW ===
${analysisData.architectureSummary.overview}
Tech Stack: ${analysisData.architectureSummary.techStack.join(", ")}
Core Concepts: ${analysisData.architectureSummary.coreConcepts.join(", ")}

=== MODULE BREAKDOWN ===
${JSON.stringify(analysisData.codeExplanations.modules, null, 2)}

=== ONBOARDING & SETUP ===
Runtime: ${analysisData.onboardingGuide.runtimeRequirements.join(", ")}
Reading Path: ${analysisData.onboardingGuide.startReadingPath.join(", ")}
Conventions: ${analysisData.onboardingGuide.keyConventions.join(", ")}

=== MERMAID ARCHITECTURE DIAGRAM ===
${analysisData.mermaidDiagram}

Answer the developer's question directly, accurately, and concisely. Focus specifically on how this codebase works. Whenever you mention a specific file, include its full path from root so it can be cited.

You MUST output your response strictly as a JSON object matching this schema:
{
  "answer": "string (clear markdown response with code snippets if applicable)",
  "citations": ["array of exact file paths mentioned, e.g. 'lib/github/client.ts'"],
  "suggestedFollowups": ["array of 3 logical follow-up questions the developer might ask next"]
}`;

    const conversationHistory = messages
      .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n\n");

    const userPrompt = `${conversationHistory ? `Previous Conversation:\n${conversationHistory}\n\n` : ""}User Question: ${question}

Provide your structured answer in JSON now.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const rawText = result.response.text();
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    const parsed: ChatResponse = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("[chat] Error processing request:", err);
    return NextResponse.json(
      { error: "Failed to answer question. Please try again.", code: "INTERNAL_ERROR" } satisfies AnalyzeErrorResponse,
      { status: 500 }
    );
  }
}
