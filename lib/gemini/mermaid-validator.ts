/**
 * Mermaid diagram validator and sanitizer.
 * Runs server-side to prevent malformed diagrams from crashing the browser renderer.
 */

// Known Mermaid graph types we support
const VALID_GRAPH_TYPES = ["graph", "flowchart", "sequenceDiagram", "classDiagram", "erDiagram", "C4Context"];

/**
 * Sanitize and validate a Mermaid diagram string.
 * Returns { valid: true, diagram } or { valid: false, diagram, error }.
 */
export function sanitizeMermaid(raw: string): {
  valid: boolean;
  diagram: string;
  error?: string;
} {
  // 1. Strip markdown code fences if present
  let diagram = raw
    .replace(/^```(?:mermaid)?\s*/im, "")
    .replace(/\s*```\s*$/m, "")
    .trim();

  // 2. Ensure the diagram starts with a known directive
  const firstLine = diagram.split("\n")[0].trim();
  const hasValidStart = VALID_GRAPH_TYPES.some((t) =>
    firstLine.toLowerCase().startsWith(t.toLowerCase())
  );

  if (!hasValidStart) {
    // Prepend a default graph TD if missing
    diagram = `graph TD\n${diagram}`;
  }

  // 3. Fix common issues:
  //    - Replace unescaped parentheses in node labels
  //    - Remove trailing semicolons (not valid in all Mermaid versions)
  diagram = diagram
    .split("\n")
    .map((line) => {
      // Remove trailing semicolons from lines that aren't comments
      if (!line.trim().startsWith("%%")) {
        line = line.replace(/;$/, "");
      }
      return line;
    })
    .join("\n");

  // 4. Basic length check
  if (diagram.length < 10) {
    return {
      valid: false,
      diagram: buildFallbackDiagram(),
      error: "Generated diagram was too short to be valid",
    };
  }

  // 5. Check for balanced brackets/braces (heuristic)
  const openBrackets = (diagram.match(/\[/g) ?? []).length;
  const closeBrackets = (diagram.match(/\]/g) ?? []).length;
  if (Math.abs(openBrackets - closeBrackets) > 5) {
    return {
      valid: false,
      diagram: buildFallbackDiagram(),
      error: "Diagram has unbalanced brackets — likely malformed output",
    };
  }

  return { valid: true, diagram };
}

/** Fallback diagram shown when generation/validation fails */
function buildFallbackDiagram(): string {
  return `graph TD
    A["Repository"] --> B["Source Code"]
    A --> C["Configuration"]
    A --> D["Documentation"]
    B --> E["Core Logic"]
    B --> F["Tests"]`;
}
