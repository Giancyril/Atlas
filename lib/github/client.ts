import { RepoInfo, TreeNode } from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Parse a GitHub repo URL into owner and repo name */
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname !== "github.com") return null;
    const parts = parsed.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

/** Fetch repository metadata + latest commit SHA */
export async function fetchRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: githubHeaders(),
    next: { revalidate: 60 },
  });

  if (repoRes.status === 403) {
    const remaining = repoRes.headers.get("x-ratelimit-remaining");
    if (remaining === "0") {
      throw Object.assign(new Error("GitHub API rate limit exceeded"), { code: "RATE_LIMITED" });
    }
    throw Object.assign(new Error("Repository is private or access forbidden"), {
      code: "PRIVATE_REPO",
    });
  }
  if (repoRes.status === 404) {
    throw Object.assign(new Error("GitHub repository not found"), { code: "NOT_FOUND" });
  }
  if (!repoRes.ok) {
    throw Object.assign(new Error(`GitHub API error: ${repoRes.status}`), {
      code: "INTERNAL_ERROR",
    });
  }

  const repoData = await repoRes.json();
  const defaultBranch: string = repoData.default_branch ?? "main";

  // Fetch latest commit SHA on default branch
  const commitRes = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${defaultBranch}`,
    {
      headers: { ...githubHeaders(), Accept: "application/vnd.github.sha" },
      next: { revalidate: 60 },
    }
  );

  let commitSha = "unknown";
  if (commitRes.ok) {
    commitSha = (await commitRes.text()).trim();
  }

  return {
    owner,
    repo,
    repoUrl: `https://github.com/${owner}/${repo}`,
    repoFullName: `${owner}/${repo}`,
    defaultBranch,
    commitSha,
    primaryLanguage: repoData.language ?? null,
    starsCount: repoData.stargazers_count ?? 0,
    description: repoData.description ?? null,
    isPrivate: repoData.private ?? false,
    size: repoData.size ?? 0, // KB
  };
}

/** Fetch recursive file tree for a repo (depth-capped at 5,000 nodes) */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string
): Promise<TreeNode[]> {
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers: githubHeaders() }
  );

  if (!res.ok) {
    throw Object.assign(new Error("Failed to fetch repository tree"), { code: "INTERNAL_ERROR" });
  }

  const data = await res.json();
  const nodes: TreeNode[] = data.tree ?? [];

  if (data.truncated) {
    console.warn(`[github] Tree was truncated for ${owner}/${repo} — analyzing visible portion`);
  }

  return nodes;
}

/** Fetch raw content of a single file by path */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<string | null> {
  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${ref}`,
    { headers: githubHeaders() }
  );

  if (!res.ok) return null;

  const data = await res.json();

  // File is too large (> 1MB via contents API) — skip
  if (data.encoding !== "base64" || !data.content) return null;

  // Decode base64 content
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  return decoded;
}
