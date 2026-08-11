# ATLAS

A production-grade, AI-augmented GitHub repository analysis platform powered by Google Gemini. Paste any public GitHub URL and instantly receive an auto-generated Mermaid architecture diagram, module-by-module code explanations with direct GitHub deep-links, a contributor onboarding checklist, a Health & Security Scorecard, a categorized Dependency Graph, and a fully contextual Ask AI chatbot grounded in the actual repository source files. Features smart PostgreSQL caching with SHA-pinned deduplication, branch and tag switching, a Share & Export modal, a Recently Analyzed history feed, and a dark-mode first design system with shimmer skeletons, typing dot animations, and multi-step progress indicators.

## Features

### Core Functionality
- **Architecture Diagram**: Auto-generated, interactive Mermaid flow diagram of the full codebase structure — rendered in the browser with zoom, pan, SVG export, and fullscreen mode
- **Code Explorer**: Module-by-module tree navigation with per-file purpose descriptions and direct GitHub deep-links anchored to the exact commit SHA analyzed
- **Onboarding Guide**: Runtime requirement lists, ordered setup commands with copy-to-clipboard support, a recommended "start reading" file path, key conventions, and a good-first-areas checklist for new contributors
- **Smart Caching**: PostgreSQL-backed analysis cache keyed on `(repo_full_name, commit_sha)` — repeated requests for the same commit return in milliseconds without burning AI quota
- **Force Re-analyze**: One-click override to bypass the cache and trigger a fresh Gemini pass on any previously analyzed repository
- **Multi-Stage Progress**: Animated step-by-step loader (Fetching Repo → Selecting Files → Analyzing → Validating → Done) so users always know exactly what the system is doing

### Advanced Features
- **Codebase Chat (`CodebaseChat`)**: Ask natural-language questions about any repository and receive answers grounded in the actual analyzed source files. Supports multi-turn conversation with suggested follow-up prompts and file-level citation badges
- **Health & Security Scorecard (`HealthScorecard`)**: Automatically grades repositories across four dimensions — Modularity, Documentation, Maintainability, and Security & Quality — with A+–F grades, numeric 0–100 scores, human-readable summaries, and actionable recommendations. Surfaces key highlights and risk factors at a glance
  - **Test Framework Detection**: Identifies Jest, Pytest, Go test, Vitest, RSpec, and other testing frameworks from config files and `package.json` scripts
  - **CI/CD Pipeline Detection**: Detects GitHub Actions workflows, CircleCI configs, Jenkinsfiles, and other pipeline definitions
  - **License & Compliance Signals**: Reads `LICENSE` file and classifies license type with compliance notes
  - **Security Policy Presence**: Flags presence or absence of `SECURITY.md` and vulnerability disclosure policies
  - **Dependency Freshness**: Evaluates lockfile presence and outdated dependency risk signals
- **Dependency Graph (`DependencyGraph`)**: Parses `package.json`, `requirements.txt` / `pyproject.toml`, `Cargo.toml`, and `go.mod` to render a categorized summary of direct, dev, and peer dependencies with version ranges and ecosystem detection (npm, pip, cargo, go)
  - **Filterable View**: Toggle between All, Direct, and Dev dependency views with live counters
  - **Ecosystem Badge**: Auto-detected package ecosystem displayed alongside the manifest filename
- **Share & Export (`ShareExportModal`)**: Copy a permalink to any analysis (SHA-pinned for reproducibility), download the full result as a structured JSON file, or export the Mermaid architecture diagram as an SVG vector image
- **Branch / Ref Selector (`BranchRefSelector`)**: Switch analysis context between any branch or release tag with a fuzzy-searchable dropdown — lists up to 100 branches and 50 tags, each with a 7-character SHA preview, and re-triggers a full analysis on selection
- **Recently Analyzed History (`RecentAnalyses`)**: Language-color-coded feed of the 10 most recently cached repositories showing repo name, commit SHA, star count, and files analyzed — one click re-opens any past analysis instantly
- **Architecture Evolution & Version Diff (`VersionDiffViewer`)**: Compare two Git branches or tags (e.g. `main` vs `v2.0.0`) to analyze structural codebase evolution, breaking API changes, added/removed modules, and step-by-step developer migration checklists using GitHub's Compare API and Gemini
- **Smart File Selection**: Token-budget-aware file picker that prioritizes entry points, configuration files, and core source modules — capped at an 80k token budget to stay within Gemini context limits while maximizing signal quality
- **Mermaid Diagram Sanitizer**: Server-side sanitizer and validator that automatically corrects common Gemini-generated Mermaid syntax errors before they reach the browser renderer — preventing blank or broken diagrams
- **Error Classification**: Structured error responses with typed codes (`INVALID_URL`, `NOT_FOUND`, `PRIVATE_REPO`, `RATE_LIMITED`, `REPO_TOO_LARGE`, `ANALYSIS_FAILED`) and user-facing recovery suggestions

### Analysis Pipeline
- **GitHub REST API Integration**: Authenticated client using a GitHub Personal Access Token — raises the rate limit from 60 to 5,000 requests/hour for uninterrupted high-volume usage
- **Structured JSON Schema Prompts**: Gemini responses are constrained to a strict JSON schema, eliminating hallucinated markdown fragments and ensuring every field (diagram, modules, onboarding, scorecard) is always present and type-safe
- **Gemini 1.5 Flash**: Uses the fastest Gemini model tier for sub-30-second full-repository analysis on typical codebases
- **Composite SHA Index**: PostgreSQL index on `(repo_full_name, commit_sha)` for O(log n) cache lookups regardless of total database size
- **Auto-Updated Timestamps**: PostgreSQL trigger automatically updates `updated_at` on every row modification — no application-level timestamp management needed

### User Experience
- **Dark Mode Design System**: Full CSS custom-property token system (`--surface-*`, `--content-*`, `--accent-*`, `--status-*`) enabling consistent theming across all components
- **Shimmer Skeletons**: CSS-only shimmer animation on loading states — no JavaScript timers needed
- **Typing Dot Animation**: Bouncing three-dot indicator in the chat interface signals when the AI assistant is generating a response
- **Chat Bubble Styles**: Distinct visual treatment for user messages (accent-colored, right-aligned) versus assistant messages (elevated surface, left-aligned) with per-message citation and follow-up rendering
- **Overflow-Safe Tab Bar**: Horizontally scrollable tab navigation with `whitespace-nowrap` tabs prevents layout breakage on narrow viewports
- **Sample Repo Quick-Launch**: Pre-populated buttons for popular open-source repositories (Express, Fastify, Prisma, Next.js) for instant zero-typing demos

## Tech Stack

### Frontend
- **Next.js 15** (App Router, TypeScript) for full-stack React with server components and API routes
- **Vanilla CSS** with custom property design tokens — no Tailwind utility classes
- **Mermaid.js** for client-side interactive diagram rendering with zoom and SVG export
- **Lucide React** for consistent iconography across all components

### Backend & AI
- **Google Gemini** (`gemini-1.5-flash`) via `@google/generative-ai` for structured repository analysis
- **GitHub REST API** for repo metadata, file tree traversal, and raw file content fetching
- **PostgreSQL** for persistent analysis cache (`repo_analyses`) and chat session storage (`chat_sessions`)
- **`pg` (node-postgres)** connection pool client with typed query wrappers

### Infrastructure
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router (TypeScript) |
| AI Model | Google Gemini 1.5 Flash |
| Database | PostgreSQL 14+ |
| ORM / Query | `pg` (node-postgres) with raw SQL |
| Diagram Engine | Mermaid.js |
| Icons | Lucide React |
| Fonts | Geist Sans & Geist Mono (Vercel) |
| Hosting | Vercel (recommended) |

## System Architecture

The system follows a layered pipeline where every user request flows from the Next.js front-end through a set of stateless API routes into a caching layer before hitting the AI model.

```mermaid
graph TD
    subgraph Client ["Frontend (Next.js App Router)"]
        UI["Page UI (6-Tab Dashboard)"]
        Tabs["Tabs: Diagram / Code / Onboard / Health / Deps / Chat"]
        Modal["Share & Export Modal"]
        Selector["Branch / Ref Selector"]
        Recent["Recent Analyses Feed"]
    end

    subgraph API ["API Routes (Next.js Route Handlers)"]
        Analyze["POST /api/analyze"]
        Report["GET /api/report"]
        RecentAPI["GET /api/analyze/recent"]
        RefsAPI["GET /api/refs"]
        ChatAPI["POST /api/chat"]
        Health["GET /api/health"]
    end

    subgraph Pipeline ["Analysis Pipeline"]
        FileSelector["Smart File Selector (80k token budget)"]
        Prompts["Structured Gemini Prompts (JSON Schema)"]
        Validator["Mermaid Diagram Sanitizer"]
    end

    subgraph External ["External Services"]
        GitHub["GitHub REST API"]
        Gemini["Google Gemini 1.5 Flash"]
        DB[(PostgreSQL Cache)]
    end

    UI --> Analyze
    UI --> ChatAPI
    Selector --> RefsAPI
    Recent --> RecentAPI

    Analyze --> DB
    DB -- "Cache Hit" --> UI
    DB -- "Cache Miss" --> FileSelector
    FileSelector --> GitHub
    FileSelector --> Prompts
    Prompts --> Gemini
    Gemini --> Validator
    Validator --> DB

    RefsAPI --> GitHub
    ChatAPI --> Gemini
    Report --> DB
```

## Module Dependency

```mermaid
graph LR
    subgraph FE ["Frontend Component Flow"]
        Page["page.tsx (6-tab dashboard)"]
        Page --> DiagramViewer
        Page --> CodeExplainer
        Page --> OnboardingGuide
        Page --> HealthScorecard
        Page --> DependencyGraph
        Page --> CodebaseChat
        Page --> ShareExportModal
        Page --> BranchRefSelector
        Page --> RecentAnalyses
        Page --> MetadataBadgeBar
        Page --> StageLoader
    end

    subgraph Lib ["Server Library Flow"]
        GHClient["github/client.ts"]
        FileSelector["github/file-selector.ts"]
        Prompts["gemini/prompts.ts"]
        Analyzer["gemini/analyzer.ts"]
        MermaidVal["gemini/mermaid-validator.ts"]
        DBClient["db/client.ts"]

        GHClient --> FileSelector
        FileSelector --> Prompts
        Prompts --> Analyzer
        Analyzer --> MermaidVal
        MermaidVal --> DBClient
    end

    subgraph Routes ["API Route Handlers"]
        AnalyzeRoute["POST /api/analyze"] --> FileSelector
        ChatRoute["POST /api/chat"] --> Analyzer
        RefsRoute["GET /api/refs"] --> GHClient
        RecentRoute["GET /api/analyze/recent"] --> DBClient
    end
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ (`psql` on PATH)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (optional — raises rate limit from 60 → 5,000 req/hour)
- A [Google AI Studio API key](https://aistudio.google.com/) for Gemini

### 1. Clone and install

```bash
git clone https://github.com/Giancyril/Atlas.git
cd Atlas
npm install
```

### 2. Configure environment

Create a `.env` file in the project root. It is listed in `.gitignore` and will never be committed.

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/atlas"

# GitHub Personal Access Token (optional but strongly recommended)
GITHUB_TOKEN="ghp_..."

# Google Gemini API Key
GEMINI_API_KEY="AIza..."
```

### 3. Initialize the database

```bash
psql -U postgres -c "CREATE DATABASE atlas;"
psql -U postgres -d atlas -f db/schema.sql
```

The schema is fully idempotent — safe to re-run at any time without data loss.

### 4. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste any GitHub repository URL, and press **Analyze**.

---

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── analyze/
│   │   │   ├── route.ts              # POST — trigger analysis; reads cache or runs pipeline
│   │   │   └── recent/
│   │   │       └── route.ts          # GET  — 10 most recently cached analyses
│   │   ├── chat/
│   │   │   └── route.ts              # POST — multi-turn codebase Q&A via Gemini
│   │   ├── health/
│   │   │   └── route.ts              # GET  — service liveness check
│   │   ├── refs/
│   │   │   └── route.ts              # GET  — list repository branches & tags
│   │   └── report/
│   │       └── route.ts              # GET  — fetch a cached analysis by repo + SHA
│   ├── globals.css                   # Full CSS design system (tokens, animations, utilities)
│   ├── layout.tsx                    # Root layout — Geist fonts, SEO metadata
│   └── page.tsx                      # Main page — URL input, 6-tab dashboard, idle state
├── components/
│   ├── branch-ref-selector.tsx       # Branch/tag fuzzy-search dropdown with SHA preview
│   ├── codebase-chat.tsx             # Multi-turn AI Q&A interface with citations
│   ├── code-explainer.tsx            # Module tree navigation with GitHub deep-links
│   ├── dependency-graph.tsx          # Filterable dependency summary by type and ecosystem
│   ├── diagram-viewer.tsx            # Mermaid renderer with zoom, pan, SVG export, fullscreen
│   ├── health-scorecard.tsx          # A+–F graded scorecard across 4 code-quality dimensions
│   ├── metadata-badge-bar.tsx        # Stars, language, forks, and commit SHA badge strip
│   ├── onboarding-guide.tsx          # Setup commands, reading path, and conventions checklist
│   ├── recent-analyses.tsx           # Language-colored history feed with one-click re-open
│   ├── share-export-modal.tsx        # Permalink copy, JSON download, SVG diagram export
│   └── stage-loader.tsx              # Multi-step animated progress indicator
├── db/
│   └── schema.sql                    # PostgreSQL schema v2 — idempotent, includes chat_sessions
├── lib/
│   ├── db/
│   │   └── client.ts                 # pg Pool with typed query<T>() wrapper
│   ├── gemini/
│   │   ├── analyzer.ts               # Builds Gemini request, parses structured JSON response
│   │   ├── mermaid-validator.ts      # Sanitizes and auto-corrects Mermaid diagram syntax
│   │   └── prompts.ts                # System prompt + per-feature user prompt templates
│   └── github/
│       ├── client.ts                 # GitHub REST API client with PAT auth + URL parser
│       └── file-selector.ts          # Priority-tier file picker within 80k token budget
└── types/
    └── index.ts                      # Full TypeScript definitions for all API surfaces
```

---

## API Documentation Overview

The backend follows a RESTful pattern with the following core routes:

- **Analysis**: `POST /api/analyze` — Accepts `{ repoUrl, forceReanalyze?, ref? }`. Returns full `AnalysisResult` from cache or triggers the full Gemini pipeline.
- **Analysis**: `GET /api/analyze/recent` — Returns the 10 most recently cached analyses ordered by `created_at DESC`, with repo name, SHA, language, stars, and file count.
- **Report**: `GET /api/report?repo=owner/name&sha=abc123` — Fetches a specific cached analysis by composite key without triggering re-analysis.
- **Refs**: `GET /api/refs?repo=https://github.com/owner/repo` — Returns all branches and tags as `BranchRef[]` with name, type, and SHA from the GitHub REST API.
- **Chat**: `POST /api/chat` — Accepts `{ repoFullName, commitSha, analysisData, messages, question }`. Returns `{ answer, citations, suggestedFollowups }` from Gemini.
- **Health**: `GET /api/health` — Returns service status and database connectivity state for uptime monitoring.

---

## Features in Detail

### Smart File Selection

The file selector (`lib/github/file-selector.ts`) uses a tiered priority system to maximize signal quality within an 80k token budget:

- **Tier 1 — Entry Points**: `main.*`, `index.*`, `app.*`, `server.*`, top-level configuration files (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`)
- **Tier 2 — Core Source**: Files in `src/`, `lib/`, `core/`, `api/` directories; README and documentation files
- **Tier 3 — Supporting Files**: Test files, utility modules, and everything else that fits within the remaining budget

Files are scored and sorted by tier before selection. Tier 1 files are always included. Tier 2 and 3 files fill the remaining token budget in priority order. Binary files, lockfiles (`package-lock.json`, `yarn.lock`), generated files, and vendor directories are automatically excluded.

### Mermaid Diagram Sanitizer

Raw Gemini output frequently contains Mermaid syntax that renders incorrectly in the browser — unclosed brackets, unsupported node shapes, special characters in labels, or empty diagrams. The sanitizer (`lib/gemini/mermaid-validator.ts`) runs a series of regex-based correction passes on the raw diagram string before it is stored or returned to the client:

- Strips markdown code fence wrappers if Gemini wraps the diagram in triple backticks
- Replaces unsupported node shapes with valid equivalents
- Escapes parentheses and special characters inside node labels
- Falls back to a minimal "architecture unavailable" placeholder if the diagram cannot be recovered

### Health & Security Scorecard

The scorecard (`lib/gemini/prompts.ts`, `components/health-scorecard.tsx`) is generated as part of the main analysis pass — no second API call required. Gemini evaluates the selected source files against four graded dimensions:

| Dimension | What it evaluates |
|-----------|-------------------|
| **Modularity** | Separation of concerns, directory organization, single-responsibility adherence |
| **Documentation** | README quality, inline comments, JSDoc/docstring coverage |
| **Maintainability** | TypeScript / type safety adoption, test file presence, linting config |
| **Security & Quality** | Dependency audit signals, secrets exposure risk, `SECURITY.md` presence |

Each dimension receives a 0–100 numeric score and an A+–F letter grade. The `overallScore` is the average of all four dimensions. `highlights` lists the top positive signals; `riskFactors` lists the top concerns.

### Codebase Chat

The chat interface (`components/codebase-chat.tsx`, `app/api/chat/route.ts`) maintains a full conversation history client-side and sends the complete message thread to Gemini on each turn — enabling true multi-turn dialogue. The system prompt injects the full `AnalysisData` (architecture summary, module explanations, onboarding guide) as grounding context so every answer is tied to the actual repository structure, not generic knowledge.

Suggested follow-up questions are generated alongside each answer and surfaced as clickable chips below the response. File-level citations (e.g., `src/lib/client.ts`) are extracted from the Gemini response and rendered as badges beneath each message.

### Branch / Ref Selector

The `BranchRefSelector` component (`components/branch-ref-selector.tsx`) fetches all branches and tags from `GET /api/refs` on demand (not on initial page load) to avoid unnecessary API calls. The dropdown is filterable by name with instant client-side fuzzy search across both branches and tags. Selecting a ref sets the `ref` parameter on the next `POST /api/analyze` request, allowing side-by-side analysis of `main` vs a release tag without navigating away.

### Share & Export

The export modal (`components/share-export-modal.tsx`) provides three export modes:

- **Permalink**: Constructs a URL with `?repo=<url>&sha=<sha>` query parameters so the exact commit-pinned analysis can be shared and re-opened without re-running Gemini
- **JSON Download**: Serializes the full `AnalysisResult` object to a `.json` file — useful for offline review, archiving, or feeding into other tooling
- **SVG Export**: Extracts the rendered Mermaid SVG from the DOM and triggers a browser download as a vector image — suitable for embedding in documentation or presentations

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `GITHUB_TOKEN` | No* | GitHub Personal Access Token — *highly recommended* (raises limit to 5,000 req/hour) |
| `GEMINI_API_KEY` | **Yes** | Google AI Studio API key for Gemini model access |

---

## Performance Notes

### Analysis Speed
- **Typical analysis time**: 15–30 seconds for repositories under 500 files
- **Cache hit time**: < 50ms for previously analyzed commits
- **Token budget**: 80,000 tokens (approx. 300–500 source files depending on size)

### Rate Limits
- **Without `GITHUB_TOKEN`**: 60 requests/hour (shared across all unauthenticated IPs)
- **With `GITHUB_TOKEN`**: 5,000 requests/hour per token
- **Gemini**: Governed by your Google AI Studio quota tier

### Database
- Composite index on `(repo_full_name, commit_sha)` for O(log n) cache lookups
- Index on `created_at DESC` for O(log n) recent-analyses queries
- Auto-trigger keeps `updated_at` accurate on every row update with no application overhead

---

## License

MIT — see [LICENSE](./LICENSE)
