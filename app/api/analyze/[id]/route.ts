import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/client";
import { AnalysisResult, AnalyzeErrorResponse } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid report ID", code: "INVALID_URL" } satisfies AnalyzeErrorResponse,
      { status: 400 }
    );
  }

  const result = await query<Record<string, unknown>>(
    `SELECT id, repo_url, repo_full_name, commit_sha, primary_language, stars_count,
            architecture_summary, mermaid_diagram, code_explanations, onboarding_guide,
            files_analyzed_count, created_at
     FROM repo_analyses WHERE id = $1 LIMIT 1`,
    [id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json(
      { error: "Analysis report not found", code: "NOT_FOUND" } satisfies AnalyzeErrorResponse,
      { status: 404 }
    );
  }

  const row = result.rows[0];
  return NextResponse.json({
    id: row.id,
    cached: true,
    repoUrl: row.repo_url,
    repoFullName: row.repo_full_name,
    commitSha: row.commit_sha,
    primaryLanguage: row.primary_language,
    starsCount: row.stars_count,
    filesAnalyzedCount: row.files_analyzed_count,
    data: {
      architectureSummary: row.architecture_summary,
      mermaidDiagram: row.mermaid_diagram,
      codeExplanations: row.code_explanations,
      onboardingGuide: row.onboarding_guide,
    },
    createdAt: row.created_at,
  } as AnalysisResult);
}
