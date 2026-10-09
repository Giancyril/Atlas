# ATLAS

**AI-powered GitHub repository explainer.** Paste any public (or private) GitHub repo URL and instantly receive:

- ≡ƒù║ **Architecture Diagram** ΓÇö Auto-generated Mermaid flow diagram of the codebase structure
- ≡ƒôé **Code Explorer** ΓÇö Module-by-module explanations with direct GitHub deep-links
- ≡ƒÜÇ **Onboarding Guide** ΓÇö Environment setup commands and first-steps checklist
- ≡ƒ¢í **Health Scorecard** ΓÇö Test coverage, CI/CD detection, license, and code quality signals
- ≡ƒôª **Dependency Graph** ΓÇö Parsed ecosystem map of all direct dependencies
- ≡ƒÆ¼ **Ask AI** ΓÇö Contextual chatbot grounded in the actual repository contents

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, TypeScript) |
| AI | [Google Gemini](https://ai.google.dev/) via `@google/generative-ai` |
| Database | PostgreSQL (analysis cache + chat sessions) |
| Diagram rendering | [Mermaid.js](https://mermaid.js.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Hosting | Vercel (recommended) |

---

## Features

### 1 ΓÇö Codebase Chat (`CodebaseChat`)
Ask natural-language questions about any repository. Responses are grounded in the actual analyzed source files.

### 2 ΓÇö Health & Security Scorecard (`HealthScorecard`)
Automatically evaluates:
- Test framework detection (Jest, Pytest, Go test, etc.)
- CI/CD pipeline presence (GitHub Actions, CircleCI, etc.)
- License type and compliance signals
- Security policy / `SECURITY.md` presence
- Dependency freshness

### 3 ΓÇö Dependency Graph (`DependencyGraph`)
Parses `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml` and more to render a categorized dependency summary.

### 4 ΓÇö Share & Export (`ShareExportModal`)
- Copy sharable link (with commit SHA pinning)
- Download analysis as JSON
- Export Mermaid diagram as SVG

### 5 ΓÇö Branch / Ref Selector (`BranchRefSelector`)
Switch analysis context between any branch or release tag in the repository. Lists up to 100 branches and 50 tags with fuzzy search.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (`psql` on PATH)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (optional but raises rate limit from 60 ΓåÆ 5000 req/hour)
- A [Google AI Studio API key](https://aistudio.google.com/) for Gemini

### 1. Clone and install

```bash
git clone https://github.com/Giancyril/Atlas.git
cd Atlas
npm install
```

### 2. Configure environment

```bash
cp .env.example .env   # create .env
# Edit .env with your values
```

Required variables:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/atlas"

# GitHub PAT (optional, but strongly recommended)
GITHUB_TOKEN="ghp_..."

# Google Gemini API Key
GEMINI_API_KEY="AIza..."
```

### 3. Initialize the database

```bash
psql -U postgres -c "CREATE DATABASE atlas;"
psql -U postgres -d atlas -f db/schema.sql
```

### 4. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste any GitHub URL.

---

## Project Structure

```
.
Γö£ΓöÇΓöÇ app/
Γöé   Γö£ΓöÇΓöÇ api/
Γöé   Γöé   Γö£ΓöÇΓöÇ analyze/
Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ route.ts          # POST ΓÇö trigger analysis
Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ recent/
Γöé   Γöé   Γöé       ΓööΓöÇΓöÇ route.ts      # GET  ΓÇö recent analyses history
Γöé   Γöé   Γö£ΓöÇΓöÇ health/
Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ route.ts          # GET  ΓÇö health check
Γöé   Γöé   Γö£ΓöÇΓöÇ refs/
Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ route.ts          # GET  ΓÇö list branches & tags
Γöé   Γöé   ΓööΓöÇΓöÇ report/
Γöé   Γöé       ΓööΓöÇΓöÇ route.ts          # GET  ΓÇö fetch cached analysis
Γöé   Γö£ΓöÇΓöÇ globals.css               # Design system (CSS variables, dark mode)
Γöé   Γö£ΓöÇΓöÇ layout.tsx                # Root layout with Geist fonts
Γöé   ΓööΓöÇΓöÇ page.tsx                  # Main page with 6-tab dashboard
Γö£ΓöÇΓöÇ components/
Γöé   Γö£ΓöÇΓöÇ branch-ref-selector.tsx   # Branch/tag picker dropdown
Γöé   Γö£ΓöÇΓöÇ codebase-chat.tsx         # AI Q&A chat interface
Γöé   Γö£ΓöÇΓöÇ code-explainer.tsx        # Module tree + explanations
Γöé   Γö£ΓöÇΓöÇ dependency-graph.tsx      # Dependency summary panel
Γöé   Γö£ΓöÇΓöÇ diagram-viewer.tsx        # Mermaid diagram with zoom & export
Γöé   Γö£ΓöÇΓöÇ health-scorecard.tsx      # Health & security scoring panel
Γöé   Γö£ΓöÇΓöÇ metadata-badge-bar.tsx    # Stars, language, forks badges
Γöé   Γö£ΓöÇΓöÇ onboarding-guide.tsx      # Setup checklist component
Γöé   Γö£ΓöÇΓöÇ recent-analyses.tsx       # History of cached analyses
Γöé   Γö£ΓöÇΓöÇ share-export-modal.tsx    # Share link / JSON / SVG export
Γöé   ΓööΓöÇΓöÇ stage-loader.tsx          # Multi-step progress indicator
Γö£ΓöÇΓöÇ db/
Γöé   ΓööΓöÇΓöÇ schema.sql                # PostgreSQL schema (idempotent)
Γö£ΓöÇΓöÇ lib/
Γöé   Γö£ΓöÇΓöÇ db/client.ts              # pg Pool client
Γöé   Γö£ΓöÇΓöÇ gemini/
Γöé   Γöé   Γö£ΓöÇΓöÇ analyzer.ts           # Gemini structured response builder
Γöé   Γöé   Γö£ΓöÇΓöÇ mermaid-validator.ts  # Mermaid diagram sanitizer
Γöé   Γöé   ΓööΓöÇΓöÇ prompts.ts            # System & user prompt templates
Γöé   ΓööΓöÇΓöÇ github/
Γöé       Γö£ΓöÇΓöÇ client.ts             # GitHub REST API client
Γöé       ΓööΓöÇΓöÇ file-selector.ts      # Smart file selection (80k token budget)
ΓööΓöÇΓöÇ types/
    ΓööΓöÇΓöÇ index.ts                  # Full TypeScript type definitions
```

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analyze` | Trigger analysis for a GitHub URL |
| `GET` | `/api/analyze/recent` | Return 10 most recent cached analyses |
| `GET` | `/api/report?repo=&sha=` | Fetch cached analysis by repo + SHA |
| `GET` | `/api/refs?repo=` | List all branches and tags |
| `GET` | `/api/health` | Service health check |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GITHUB_TOKEN` | No* | GitHub PAT ΓÇö *highly recommended* |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

---

## License

MIT ΓÇö see [LICENSE](./LICENSE)
