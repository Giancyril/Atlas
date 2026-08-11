import { DependencySummary, DependencyItem, FileContent } from "@/types";

/**
 * Parse dependency manifests (package.json, pyproject.toml, go.mod, Cargo.toml) into structured DependencySummary
 */
export function parseDependencies(files: FileContent[]): DependencySummary | undefined {
  // Find manifest file
  const pkgJson = files.find((f) => f.path === "package.json");
  if (pkgJson) return parsePackageJson(pkgJson.content);

  const cargoToml = files.find((f) => f.path.toLowerCase() === "cargo.toml");
  if (cargoToml) return parseCargoToml(cargoToml.content);

  const goMod = files.find((f) => f.path === "go.mod");
  if (goMod) return parseGoMod(goMod.content);

  const pyproject = files.find((f) => f.path.toLowerCase() === "pyproject.toml");
  if (pyproject) return parsePyprojectToml(pyproject.content);

  return undefined;
}

function parsePackageJson(content: string): DependencySummary {
  try {
    const pkg = JSON.parse(content);
    const deps: DependencyItem[] = [];

    if (pkg.dependencies) {
      Object.entries(pkg.dependencies).forEach(([name, ver]) => {
        deps.push({
          name,
          version: String(ver),
          type: "direct",
          category: categorizeNpmPackage(name),
        });
      });
    }

    if (pkg.devDependencies) {
      Object.entries(pkg.devDependencies).forEach(([name, ver]) => {
        deps.push({
          name,
          version: String(ver),
          type: "dev",
          category: "Development & Testing",
        });
      });
    }

    const directCount = deps.filter((d) => d.type === "direct").length;
    const devCount = deps.filter((d) => d.type === "dev").length;

    return {
      manifestFile: "package.json",
      ecosystem: "npm",
      directCount,
      devCount,
      dependencies: deps,
    };
  } catch {
    return {
      manifestFile: "package.json",
      ecosystem: "npm",
      directCount: 0,
      devCount: 0,
      dependencies: [],
    };
  }
}

function parseCargoToml(content: string): DependencySummary {
  const deps: DependencyItem[] = [];
  const lines = content.split("\n");
  let inDeps = false;

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith("[dependencies]")) {
      inDeps = true;
      return;
    }
    if (line.startsWith("[")) {
      inDeps = false;
      return;
    }
    if (inDeps && line && !line.startsWith("#")) {
      const match = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
      if (match) {
        deps.push({
          name: match[1],
          version: match[2].replace(/["']/g, ""),
          type: "direct",
          category: "Crate",
        });
      }
    }
  });

  return {
    manifestFile: "Cargo.toml",
    ecosystem: "cargo",
    directCount: deps.length,
    devCount: 0,
    dependencies: deps,
  };
}

function parseGoMod(content: string): DependencySummary {
  const deps: DependencyItem[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith("require ") || line.includes("v0.") || line.includes("v1.") || line.includes("v2.")) {
      const parts = line.replace("require ", "").replace("(", "").replace(")", "").trim().split(/\s+/);
      if (parts.length >= 2) {
        deps.push({
          name: parts[0],
          version: parts[1],
          type: "direct",
          category: "Go Module",
        });
      }
    }
  });

  return {
    manifestFile: "go.mod",
    ecosystem: "go",
    directCount: deps.length,
    devCount: 0,
    dependencies: deps,
  };
}

function parsePyprojectToml(content: string): DependencySummary {
  const deps: DependencyItem[] = [];
  const lines = content.split("\n");

  lines.forEach((line) => {
    line = line.trim();
    if (line.startsWith('"') || line.startsWith("'") || /^[a-zA-Z0-9_-]+\s*=/.test(line)) {
      const match = line.match(/^"?([a-zA-Z0-9_-]+)"?\s*[=>=<~^]*\s*"?([^"'\s,#]+)?"?/);
      if (match && match[1] && match[1] !== "name" && match[1] !== "version") {
        deps.push({
          name: match[1],
          version: match[2] ?? "*",
          type: "direct",
          category: "Python Package",
        });
      }
    }
  });

  return {
    manifestFile: "pyproject.toml",
    ecosystem: "pip",
    directCount: deps.length,
    devCount: 0,
    dependencies: deps,
  };
}

function categorizeNpmPackage(name: string): string {
  if (name.includes("react") || name.includes("next") || name.includes("vue") || name.includes("svelte")) return "Frontend Framework";
  if (name.includes("express") || name.includes("fastify") || name.includes("nest") || name.includes("koa")) return "Backend / API";
  if (name.includes("pg") || name.includes("prisma") || name.includes("drizzle") || name.includes("mongo") || name.includes("redis")) return "Database / ORM";
  if (name.includes("tailwind") || name.includes("lucide") || name.includes("clsx") || name.includes("styled")) return "UI & Styling";
  if (name.includes("gemini") || name.includes("openai") || name.includes("ai") || name.includes("langchain")) return "AI & LLM Integration";
  return "Core Utility";
}
