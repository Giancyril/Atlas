import { NextResponse } from "next/server";
import { getPool } from "@/lib/db/client";

export async function GET() {
  const checks: Record<string, string> = {
    githubApi: process.env.GITHUB_TOKEN ? "authenticated" : "unauthenticated (rate limits apply)",
    geminiApi: process.env.GEMINI_API_KEY ? "configured" : "not configured",
    db: "unknown",
  };

  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    checks.db = "connected";
  } catch {
    checks.db = "disconnected";
  }

  const healthy = checks.db === "connected" && checks.geminiApi === "configured";

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      ...checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
