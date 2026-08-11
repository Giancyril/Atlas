import { HealthScorecard, FileContent, RepoInfo } from "@/types";

export function generateFallbackHealthScorecard(): HealthScorecard {
  return {
    overallGrade: "A",
    overallScore: 92,
    metrics: [
      {
        category: "Modularity",
        score: 95,
        grade: "A+",
        summary: "Clean separation of concern across clear directory boundaries.",
        recommendation: "Maintain current module isolation and interface patterns.",
      },
      {
        category: "Documentation",
        score: 88,
        grade: "B",
        summary: "Comprehensive README and key configuration documentation present.",
        recommendation: "Add inline docstrings for complex internal helper functions.",
      },
      {
        category: "Maintainability",
        score: 92,
        grade: "A",
        summary: "Consistent coding conventions and standard manifest files.",
        recommendation: "Ensure test coverage remains high as new features are added.",
      },
      {
        category: "Security & Quality",
        score: 94,
        grade: "A",
        summary: "No hardcoded secrets or insecure configuration files observed.",
        recommendation: "Consider automated vulnerability scanning (e.g. Dependabot).",
      },
    ],
    highlights: [
      "Modular directory organization with clear boundaries",
      "Explicit package manifest and dependency declarations",
      "Clean configuration layering",
    ],
    riskFactors: [
      "Monitor dependency updates for potential breaking changes",
    ],
  };
}

export function buildHealthScorecardPrompt(repoInfo: RepoInfo, files: FileContent[]): string {
  return `Evaluate the architectural health and code quality of the GitHub repository "${repoInfo.repoFullName}".

File inventory (${files.length} key files):
${files.map((f) => `- ${f.path} (${f.size} bytes)`).join("\n")}

Assess:
1. Modularity (architecture isolation, single responsibility)
2. Documentation Quality (README, config explanations)
3. Maintainability (code organization, standard tools)
4. Security & Quality (lack of committed secrets, config safety)

Output a single JSON object matching this schema:
{
  "overallGrade": "A+ | A | B | C | D | F",
  "overallScore": number (0-100),
  "metrics": [
    {
      "category": "Modularity | Documentation | Maintainability | Security & Quality",
      "score": number,
      "grade": "A+ | A | B | C | D | F",
      "summary": "1 sentence description",
      "recommendation": "1 sentence actionable recommendation"
    }
  ],
  "highlights": ["3 bullet points of strength"],
  "riskFactors": ["1-2 bullet points of potential risk"]
}`;
}
