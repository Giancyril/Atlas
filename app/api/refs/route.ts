import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl } from "@/lib/github/client";
import { BranchRef } from "@/components/branch-ref-selector";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoUrl = searchParams.get("repo");

  if (!repoUrl) {
    return NextResponse.json({ error: "Missing repo parameter" }, { status: 400 });
  }

  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 });
  }

  const { owner, repo } = parsed;
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const [branchRes, tagRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=50`, { headers }),
    ]);

    if (!branchRes.ok) {
      return NextResponse.json({ error: "Failed to fetch branches" }, { status: branchRes.status });
    }

    const branchData = await branchRes.json();
    const tagData = tagRes.ok ? await tagRes.json() : [];

    const refs: BranchRef[] = [
      ...branchData.map((b: { name: string; commit: { sha: string } }) => ({
        name: b.name,
        type: "branch" as const,
        sha: b.commit.sha,
      })),
      ...tagData.map((t: { name: string; commit: { sha: string } }) => ({
        name: t.name,
        type: "tag" as const,
        sha: t.commit?.sha ?? "",
      })),
    ];

    return NextResponse.json({ refs });
  } catch {
    return NextResponse.json({ error: "Failed to fetch repository refs" }, { status: 500 });
  }
}
