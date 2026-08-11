import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl } from "@/lib/github/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildVersionDiffPrompt, parseVersionDiffResponse } from "@/lib/gemini/prompts";
import { VersionDiffSummary } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl, baseRef, compareRef } = body;

    if (!repoUrl || !baseRef || !compareRef) {
      return NextResponse.json(
        { error: "Missing required fields: repoUrl, baseRef, compareRef" },
        { status: 400 }
      );
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const { owner, repo } = parsed;
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    // Compare two commits / refs on GitHub REST API
    const diffRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/compare/${encodeURIComponent(baseRef)}...${encodeURIComponent(compareRef)}`,
      { headers }
    );

    if (!diffRes.ok) {
      return NextResponse.json(
        { error: `GitHub API error comparing ${baseRef} and ${compareRef}: ${diffRes.statusText}` },
        { status: diffRes.status }
      );
    }

    const compareData = await diffRes.json();
    const files: { filename: string; status: "added" | "removed" | "modified" | "renamed" }[] =
      compareData.files ?? [];

    const addedFiles = files.filter((f) => f.status === "added").map((f) => f.filename);
    const removedFiles = files.filter((f) => f.status === "removed").map((f) => f.filename);
    const modifiedFiles = files.filter((f) => f.status === "modified" || f.status === "renamed").map((f) => f.filename);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback response if GEMINI_API_KEY is not configured
      const fallback: VersionDiffSummary = {
        baseRef,
        compareRef,
        totalFilesChanged: files.length,
        evolutionSummary: `Comparing ${baseRef} to ${compareRef} showing ${files.length} total file changes.`,
        addedModules: addedFiles.slice(0, 10),
        removedModules: removedFiles.slice(0, 10),
        modifiedModules: modifiedFiles.slice(0, 10).map((f) => ({
          name: f,
          impact: "medium",
          description: "File updated between reference versions",
        })),
        breakingChanges: [],
        migrationGuide: ["Review modified module files before upgrading."],
      };
      return NextResponse.json({ diff: fallback });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = buildVersionDiffPrompt(
      `${owner}/${repo}`,
      baseRef,
      compareRef,
      addedFiles,
      removedFiles,
      modifiedFiles
    );

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const diffData: VersionDiffSummary = parseVersionDiffResponse(rawText);

    return NextResponse.json({ diff: diffData });
  } catch (err: any) {
    console.error("[diff] Error generating version diff:", err);
    return NextResponse.json(
      { error: err.message || "Failed to compare repository references" },
      { status: 500 }
    );
  }
}
