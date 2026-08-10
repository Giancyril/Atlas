import { FileContent, RepoInfo, AnalysisData } from "@/types";

export const ANALYSIS_SYSTEM_PROMPT = `You are an expert software engineer specializing in analyzing and explaining codebases.
Your task is to analyze a GitHub repository and produce a comprehensive, structured analysis.

You MUST respond with a single, valid JSON object matching the schema below — no markdown fences, no extra text.

JSON Schema:
{
  "architectureSummary": {
    "overview": "string (2-4 sentences describing what this project does and how it's structured)",
    "techStack": ["string array of technologies, frameworks, and libraries used"],
    "coreConcepts": ["string array of 3-6 key architectural patterns or concepts"],
    "primaryLanguage": "string",
    "projectType": "string (e.g. 'Web Application', 'CLI Tool', 'Library', 'Monorepo', 'API Service')"
  },
  "mermaidDiagram": "string — a valid Mermaid.js graph TD diagram showing high-level architecture. Use subgraphs to group related components. Keep it at module/subsystem level (not individual files/functions). Escape any special characters in node labels with quotes.",
  "codeExplanations": {
    "modules": [
      {
        "name": "string (human-readable module name)",
        "path": "string (directory or file path)",
        "description": "string (1-2 sentences on what this module does)",
        "purpose": "string (why this module exists in the architecture)",
        "files": [
          {
            "path": "string (exact file path from repo root)",
            "purpose": "string (what this specific file does)",
            "keyExports": ["string array of key exported functions/classes/types, if applicable"],
            "githubUrl": "string (full GitHub URL to this file)"
          }
        ]
      }
    ],
    "spotlightFiles": [
      {
        "path": "string",
        "purpose": "string",
        "keyExports": ["string array"],
        "githubUrl": "string"
      }
    ]
  },
  "onboardingGuide": {
    "runtimeRequirements": ["string array (e.g. 'Node.js >= 18', 'Docker', 'Go 1.21+')"],
    "setupSteps": [
      {
        "command": "string (exact terminal command)",
        "description": "string (what this step does)"
      }
    ],
    "startReadingPath": ["string array of file paths in order a new developer should read them"],
    "keyConventions": ["string array of design patterns, naming conventions, or architectural decisions observed"],
    "goodFirstAreas": ["string array of directories or files that are low-complexity and good for new contributors"]
  }
}

Rules for the Mermaid diagram:
- Use "graph TD" (top-down) format
- Group components into subgraphs (e.g. subgraph Frontend, subgraph Backend, subgraph Database)
- Wrap all node labels in double quotes if they contain spaces, parentheses, or special chars
- Use arrows like --> and -.-> for different relationship types
- Keep to max 20 nodes total for readability
- Do NOT include markdown code fences in the mermaidDiagram value — just the raw Mermaid syntax

Rules for GitHub URLs in files:
- All githubUrl values should follow this format: https://github.com/{owner}/{repo}/blob/{commitSha}/{filePath}`;

export function buildAnalysisPrompt(
  repoInfo: RepoInfo,
  files: FileContent[]
): string {
  const fileContentsSection = files
    .map(
      (f) =>
        `=== FILE: ${f.path} (tier ${f.tier}) ===\n${f.content}\n=== END FILE ===`
    )
    .join("\n\n");

  return `Analyze the following GitHub repository and generate a comprehensive structured analysis.

Repository: ${repoInfo.repoFullName}
URL: ${repoInfo.repoUrl}
Commit SHA: ${repoInfo.commitSha}
Primary Language: ${repoInfo.primaryLanguage ?? "Unknown"}
Description: ${repoInfo.description ?? "No description provided"}
Stars: ${repoInfo.starsCount}

Files analyzed (${files.length} files selected from repository):

${fileContentsSection}

Generate the structured JSON analysis now. Remember to:
1. Build GitHub URLs using commit SHA: ${repoInfo.commitSha}
2. Keep the Mermaid diagram at module/subsystem level (not individual files)
3. Derive setup steps from actual package.json scripts, Makefile, or Dockerfile — do not guess generically
4. All JSON strings must be properly escaped`;
}

export function parseAnalysisResponse(rawJson: string): AnalysisData {
  // Strip any accidental markdown fences the model might add
  const cleaned = rawJson
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  // Basic structural validation
  if (
    !parsed.architectureSummary ||
    !parsed.mermaidDiagram ||
    !parsed.codeExplanations ||
    !parsed.onboardingGuide
  ) {
    throw new Error("Gemini response missing required top-level fields");
  }

  return parsed as AnalysisData;
}
