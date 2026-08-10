import { TreeNode, FileContent } from "@/types";
import { fetchFileContent } from "./client";

// Max tokens budget for file contents (~80k tokens ≈ ~320KB of UTF-8 text)
const MAX_CONTENT_BYTES = 320_000;
// Max single file size
const MAX_FILE_SIZE_BYTES = 50_000; // 50 KB
// Max total files to fetch
const MAX_FILES = 35;

// Tier 1: Package manifests and repo meta files (highest priority)
const TIER_1_PATTERNS = [
  /^readme(\.(md|txt|rst))?$/i,
  /^package\.json$/,
  /^cargo\.toml$/i,
  /^pyproject\.toml$/i,
  /^go\.mod$/,
  /^composer\.json$/,
  /^gemfile$/i,
  /^build\.gradle(\.kts)?$/i,
  /^pom\.xml$/,
  /^dockerfile$/i,
  /^docker-compose(\.(yml|yaml))?$/i,
  /^makefile$/i,
  /^\.env\.example$/i,
];

// Tier 2: Application entry points and core config
const TIER_2_PATTERNS = [
  /^(src\/)?index\.(ts|js|tsx|jsx)$/,
  /^(src\/)?main\.(ts|js|go|rs|py)$/,
  /^(src\/)?app\.(ts|tsx|py)$/,
  /^app\/(layout|page)\.(tsx|jsx)$/,
  /^next\.config\.(js|ts|mjs)$/,
  /^vite\.config\.(ts|js)$/,
  /^webpack\.config\.(js|ts)$/,
  /^tsconfig\.json$/,
  /^jest\.config\.(js|ts|json)$/,
  /^\.eslintrc(\.(js|json|yml))?$/i,
];

// Files/directories to always skip
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next\//,
  /dist\//,
  /build\//,
  /\.git\//,
  /coverage\//,
  /\.cache\//,
  /vendor\//,
  /target\//,
  /\.yarn\//,
  /pods\//,
  /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|mp4|mp3|pdf|zip|tar|gz|wasm|bin|exe)$/i,
  /(package-lock|yarn\.lock|pnpm-lock|composer\.lock|gemfile\.lock|cargo\.lock)\.?(json|yaml|yml)?$/i,
  /\.min\.(js|css)$/,
  /\.d\.ts$/,
];

function isExcluded(path: string): boolean {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(path));
}

function getFilename(path: string): string {
  return path.split("/").pop() ?? path;
}

function getTier(path: string): 1 | 2 | 3 {
  const filename = getFilename(path);
  if (TIER_1_PATTERNS.some((p) => p.test(filename) || p.test(path))) return 1;
  if (TIER_2_PATTERNS.some((p) => p.test(filename) || p.test(path))) return 2;
  return 3;
}

/** Select the most important files to analyze from a repo tree */
export function selectKeyFiles(tree: TreeNode[]): TreeNode[] {
  // Only consider blobs (files), not trees (directories)
  const files = tree.filter(
    (n) =>
      n.type === "blob" &&
      !isExcluded(n.path) &&
      (n.size === undefined || n.size <= MAX_FILE_SIZE_BYTES)
  );

  // Group by tier
  const tier1 = files.filter((f) => getTier(f.path) === 1);
  const tier2 = files.filter((f) => getTier(f.path) === 2);
  const tier3 = files.filter((f) => getTier(f.path) === 3);

  // Sort tier 3 by path depth (prefer shallower files) then size (prefer smaller)
  tier3.sort((a, b) => {
    const depthDiff = a.path.split("/").length - b.path.split("/").length;
    if (depthDiff !== 0) return depthDiff;
    return (a.size ?? 0) - (b.size ?? 0);
  });

  // Build selection respecting MAX_FILES limit
  const selected: TreeNode[] = [
    ...tier1,
    ...tier2.slice(0, 10),
    ...tier3.slice(0, MAX_FILES - tier1.length - Math.min(tier2.length, 10)),
  ].slice(0, MAX_FILES);

  return selected;
}

/** Fetch content for selected files, respecting total byte budget */
export async function fetchSelectedFiles(
  owner: string,
  repo: string,
  ref: string,
  selectedNodes: TreeNode[]
): Promise<FileContent[]> {
  const results: FileContent[] = [];
  let totalBytes = 0;

  for (const node of selectedNodes) {
    if (totalBytes >= MAX_CONTENT_BYTES) break;

    const content = await fetchFileContent(owner, repo, node.path, ref);
    if (!content) continue;

    const byteSize = Buffer.byteLength(content, "utf-8");
    if (totalBytes + byteSize > MAX_CONTENT_BYTES) {
      // Trim content to fit budget
      const remaining = MAX_CONTENT_BYTES - totalBytes;
      const trimmed = content.slice(0, remaining);
      results.push({
        path: node.path,
        content: trimmed + "\n... [truncated: file too large for context window]",
        size: byteSize,
        tier: getTier(node.path),
      });
      totalBytes += remaining;
      break;
    }

    results.push({
      path: node.path,
      content,
      size: byteSize,
      tier: getTier(node.path),
    });
    totalBytes += byteSize;
  }

  return results;
}
