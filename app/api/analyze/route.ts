import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl, fetchRepoInfo, fetchRepoTree } from "@/lib/github/client";
import { selectKeyFiles, fetchSelectedFiles } from "@/lib/github/file-selector";
import { analyzeRepository } from "@/lib/gemini/analyzer";
import { sanitizeMermaid } from "@/lib/gemini/mermaid-validator";
import { query } from "@/lib/db/client";
import { AnalyzeRequest, AnalysisResult, AnalyzeErrorResponse } from "@/types";

const LARGE_REPO_THRESHOLD_KB = 500_000; // 500 MB

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { repoUrl, forceReanalyze = false } = body;

    // --- 1. Validate URL ---
    if (!repoUrl || typeof repoUrl !== "string") {
      return errorResponse("Please provide a valid GitHub repository URL", "INVALID_URL", 400);
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      return errorResponse(
        "Invalid GitHub URL. Please use a format like https://github.com/owner/repo",
        "INVALID_URL",
        400
      );
    }

    const { owner, repo } = parsed;

    // --- 2. Fetch repo metadata + latest commit SHA ---
    let repoInfo;
    try {
      repoInfo = await fetchRepoInfo(owner, repo);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "RATE_LIMITED") {
        return errorResponse(
          "GitHub API rate limit exceeded. Please try again later.",
          "RATE_LIMITED",
          429
        );
      }
      if (error.code === "PRIVATE_REPO") {
        return errorResponse(
          "This repository is private or access is forbidden. Only public repositories are supported.",
          "PRIVATE_REPO",
          403
        );
      }
      if (error.code === "NOT_FOUND") {
        return errorResponse(
          "Repository not found. Please verify the URL is correct and the repository is public.",
          "NOT_FOUND",
          404
        );
      }
      throw err;
    }

    // --- 3. Check repo size ---
    if (repoInfo.size > LARGE_REPO_THRESHOLD_KB) {
      return errorResponse(
        `This repository is very large (${Math.round(repoInfo.size / 1024)} MB). Analysis is capped at large repositories — only the most critical files will be analyzed.`,
        "REPO_TOO_LARGE",
        422
      );
    }

    // --- 4. Check cache (unless force re-analyze) ---
    if (!forceReanalyze) {
      const cached = await query<{ id: string; data: Record<string, unknown>; created_at: string; stars_count: number; primary_language: string; files_analyzed_count: number }>(
        `SELECT id, architecture_summary, mermaid_diagram, code_explanations, onboarding_guide, 
         created_at, stars_count, primary_language, files_analyzed_count
         FROM repo_analyses
         WHERE repo_full_name = $1 AND commit_sha = $2
         LIMIT 1`,
        [repoInfo.repoFullName, repoInfo.commitSha]
      );

      if (cached.rowCount > 0) {
        const row = cached.rows[0] as Record<string, unknown>;
        return NextResponse.json({
          id: row.id,
          cached: true,
          repoUrl: repoInfo.repoUrl,
          repoFullName: repoInfo.repoFullName,
          commitSha: repoInfo.commitSha,
          primaryLanguage: row.primary_language ?? repoInfo.primaryLanguage,
          starsCount: row.stars_count ?? repoInfo.starsCount,
          filesAnalyzedCount: row.files_analyzed_count ?? 0,
          data: {
            architectureSummary: row.architecture_summary,
            mermaidDiagram: row.mermaid_diagram,
            codeExplanations: row.code_explanations,
            onboardingGuide: row.onboarding_guide,
          },
          createdAt: row.created_at,
        } as AnalysisResult);
      }
    }

    // --- 5. Fetch file tree ---
    const tree = await fetchRepoTree(owner, repo, repoInfo.defaultBranch);

    // --- 6. Select key files ---
    const selectedNodes = selectKeyFiles(tree);

    // --- 7. Fetch file contents ---
    const files = await fetchSelectedFiles(
      owner,
      repo,
      repoInfo.commitSha,
      selectedNodes
    );

    if (files.length === 0) {
      return errorResponse(
        "Could not retrieve any readable files from this repository.",
        "ANALYSIS_FAILED",
        422
      );
    }

    // --- 8. Run Gemini analysis ---
    let analysisData;
    try {
      analysisData = await analyzeRepository(repoInfo, files);
    } catch (err: unknown) {
      console.error("[analyze] Gemini analysis failed:", err);
      return errorResponse(
        "AI analysis failed. This may be a temporary issue — please try again.",
        "ANALYSIS_FAILED",
        500
      );
    }

    // --- 9. Validate & sanitize Mermaid diagram ---
    const { diagram } = sanitizeMermaid(analysisData.mermaidDiagram);
    analysisData.mermaidDiagram = diagram;

    // --- 10. Persist to Postgres ---
    const upsertResult = await query<{ id: string; created_at: string }>(
      `INSERT INTO repo_analyses (
         repo_url, repo_full_name, commit_sha, default_branch,
         primary_language, stars_count, description,
         architecture_summary, mermaid_diagram, code_explanations, onboarding_guide,
         files_analyzed_count
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (repo_full_name, commit_sha) DO UPDATE SET
         architecture_summary = EXCLUDED.architecture_summary,
         mermaid_diagram = EXCLUDED.mermaid_diagram,
         code_explanations = EXCLUDED.code_explanations,
         onboarding_guide = EXCLUDED.onboarding_guide,
         files_analyzed_count = EXCLUDED.files_analyzed_count,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, created_at`,
      [
        repoInfo.repoUrl,
        repoInfo.repoFullName,
        repoInfo.commitSha,
        repoInfo.defaultBranch,
        repoInfo.primaryLanguage,
        repoInfo.starsCount,
        repoInfo.description,
        JSON.stringify(analysisData.architectureSummary),
        analysisData.mermaidDiagram,
        JSON.stringify(analysisData.codeExplanations),
        JSON.stringify(analysisData.onboardingGuide),
        files.length,
      ]
    );

    const savedRow = upsertResult.rows[0];

    return NextResponse.json({
      id: savedRow.id,
      cached: false,
      repoUrl: repoInfo.repoUrl,
      repoFullName: repoInfo.repoFullName,
      commitSha: repoInfo.commitSha,
      primaryLanguage: repoInfo.primaryLanguage,
      starsCount: repoInfo.starsCount,
      filesAnalyzedCount: files.length,
      data: analysisData,
      createdAt: savedRow.created_at,
    } as AnalysisResult);
  } catch (err: unknown) {
    console.error("[analyze] Unexpected error:", err);
    return errorResponse(
      "An unexpected error occurred. Please try again.",
      "INTERNAL_ERROR",
      500
    );
  }
}

function errorResponse(
  error: string,
  code: AnalyzeErrorResponse["code"],
  status: number
): NextResponse {
  return NextResponse.json({ error, code } satisfies AnalyzeErrorResponse, { status });
}
