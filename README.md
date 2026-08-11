# ATLAS

**AI-powered GitHub repository explainer.** Paste any public (or private) GitHub repo URL and instantly receive:

- 🗺 **Architecture Diagram** — Auto-generated Mermaid flow diagram of the codebase structure
- 📂 **Code Explorer** — Module-by-module explanations with direct GitHub deep-links
- 🚀 **Onboarding Guide** — Environment setup commands and first-steps checklist
- 🛡 **Health Scorecard** — Test coverage, CI/CD detection, license, and code quality signals
- 📦 **Dependency Graph** — Parsed ecosystem map of all direct dependencies
- 💬 **Ask AI** — Contextual chatbot grounded in the actual repository contents

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

### 1 — Codebase Chat (`CodebaseChat`)
Ask natural-language questions about any repository. Responses are grounded in the actual analyzed source files.

### 2 — Health & Security Scorecard (`HealthScorecard`)
Automatically evaluates:
- Test framework detection (Jest, Pytest, Go test, etc.)
- CI/CD pipeline presence (GitHub Actions, CircleCI, etc.)
- License type and compliance signals
- Security policy / `SECURITY.md` presence
- Dependency freshness

### 3 — Dependency Graph (`DependencyGraph`)
Parses `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml` and more to render a categorized dependency summary.

### 4 — Share & Export (`ShareExportModal`)
- Copy sharable link (with commit SHA pinning)
- Download analysis as JSON
- Export Mermaid diagram as SVG

### 5 — Branch / Ref Selector (`BranchRefSelector`)
Switch analysis context between any branch or release tag in the repository. Lists up to 100 branches and 50 tags with fuzzy search.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (`psql` on PATH)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (optional but raises rate limit from 60 → 5000 req/hour)
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
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   ├── route.ts          # POST — trigger analysis
│   │   │   └── recent/
│   │   │       └── route.ts      # GET  — recent analyses history
│   │   ├── health/
│   │   │   └── route.ts          # GET  — health check
│   │   ├── refs/
│   │   │   └── route.ts          # GET  — list branches & tags
│   │   └── report/
│   │       └── route.ts          # GET  — fetch cached analysis
│   ├── globals.css               # Design system (CSS variables, dark mode)
│   ├── layout.tsx                # Root layout with Geist fonts
│   └── page.tsx                  # Main page with 6-tab dashboard
├── components/
│   ├── branch-ref-selector.tsx   # Branch/tag picker dropdown
│   ├── codebase-chat.tsx         # AI Q&A chat interface
│   ├── code-explainer.tsx        # Module tree + explanations
│   ├── dependency-graph.tsx      # Dependency summary panel
│   ├── diagram-viewer.tsx        # Mermaid diagram with zoom & export
│   ├── health-scorecard.tsx      # Health & security scoring panel
│   ├── metadata-badge-bar.tsx    # Stars, language, forks badges
│   ├── onboarding-guide.tsx      # Setup checklist component
│   ├── recent-analyses.tsx       # History of cached analyses
│   ├── share-export-modal.tsx    # Share link / JSON / SVG export
│   └── stage-loader.tsx          # Multi-step progress indicator
├── db/
│   └── schema.sql                # PostgreSQL schema (idempotent)
├── lib/
│   ├── db/client.ts              # pg Pool client
│   ├── gemini/
│   │   ├── analyzer.ts           # Gemini structured response builder
│   │   ├── mermaid-validator.ts  # Mermaid diagram sanitizer
│   │   └── prompts.ts            # System & user prompt templates
│   └── github/
│       ├── client.ts             # GitHub REST API client
│       └── file-selector.ts      # Smart file selection (80k token budget)
└── types/
    └── index.ts                  # Full TypeScript type definitions
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
| `GITHUB_TOKEN` | No* | GitHub PAT — *highly recommended* |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

---

## License

MIT — see [LICENSE](./LICENSE)
