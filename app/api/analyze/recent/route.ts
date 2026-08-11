import { NextResponse } from "next/server";
import { query } from "@/lib/db/client";

export async function GET() {
  try {
    const result = await query<{
      id: string;
      repo_url: string;
      repo_full_name: string;
      commit_sha: string;
      primary_language: string | null;
      stars_count: number;
      files_analyzed_count: number;
      created_at: string;
    }>(
      `SELECT id, repo_url, repo_full_name, commit_sha, primary_language, stars_count, files_analyzed_count, created_at
       FROM repo_analyses
       ORDER BY created_at DESC
       LIMIT 10`,
      []
    );

    return NextResponse.json({ analyses: result.rows });
  } catch (err) {
    console.error("[recent] DB error:", err);
    return NextResponse.json({ analyses: [] });
  }
}
