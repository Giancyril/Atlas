import { GoogleGenerativeAI } from "@google/generative-ai";
import { FileContent, RepoInfo, AnalysisData } from "@/types";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  parseAnalysisResponse,
} from "./prompts";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeRepository(
  repoInfo: RepoInfo,
  files: FileContent[]
): Promise<AnalysisData> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: ANALYSIS_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.2, // Low temp for consistent structured JSON
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const userPrompt = buildAnalysisPrompt(repoInfo, files);

  const result = await model.generateContent(userPrompt);
  const response = result.response;
  const rawText = response.text();

  if (!rawText) {
    throw new Error("Gemini returned an empty response");
  }

  return parseAnalysisResponse(rawText);
}
