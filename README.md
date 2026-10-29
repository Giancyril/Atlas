# ATLAS

A production-grade, AI-augmented GitHub repository comprehension and architecture analysis platform designed for developers, engineering leads, and technical auditors. Features automated multi-layer architecture diagram generation with Mermaid.js, Google Gemini 1.5 Flash-powered structured codebase synthesis, interactive AST and module-level code explorer with deep-linked GitHub references, contextual codebase Q&A chat grounded in actual repository source files with citation tracking, automated Health & Security scorecard auditing, multi-ecosystem dependency graph extraction (npm, Cargo, Go, pip), branch & release tag version ref switching, Architecture Evolution & semantic git diffing, SHA-pinned PostgreSQL analysis caching, multi-format export (Markdown, JSON, SVG, README badges), and an interactive onboarding guide with derived local setup pipelines.

## Features

### Core Functionality
- **Automated Repository Ingestion**: Instantly ingest and analyze any public (or private with PAT) GitHub repository URL, resolving default branches, latest commit SHAs, star counts, and language footprints.
- **System Architecture Visualizer**: Auto-generates interactive Mermaid.js architecture diagrams grouping modules into subgraphs (Client, Server, API, Services, Database) with zoom, pan, and fullscreen modes.
- **Module-by-Module Code Explorer**: Interactive directory and module explorer providing high-level purposes, file-level explanations, key exports, and direct GitHub source code links.
- **Curated Onboarding Guide**: Step-by-step developer onboarding checklist with runtime requirements, exact terminal setup commands extracted from manifests, and an optimized reading path.
- **Commit SHA-Pinned Caching**: Idempotent PostgreSQL persistence keyed by `(repo_full_name, commit_sha)`, delivering instant sub-10ms cache retrieval for previously analyzed repositories.
- **Export & Sharing Suite**: One-click export of complete architecture reports in Markdown, raw JSON payloads, SVG diagrams, and dynamic Markdown badges for repository READMEs.

### Advanced Features
- **Intelligent Multi-Tier File Selector**: Heuristic file selection engine respecting an 80k token budget (~320KB UTF-8 text). Categorizes repository trees into Tier 1 (manifests, Dockerfiles, root configs), Tier 2 (application entry points, routing hubs), and Tier 3 (shallow directory files), filtering out binary assets, build artifacts, lockfiles, and minified bundles.
- **Google Gemini 1.5 Flash Synthesis Engine**: Uses structured JSON response mode (`responseMimeType: "application/json"`) with strict schema enforcement to generate reliable, hallucination-resistant architecture summaries and setup instructions.
- **Mermaid Diagram Sanitizer & Fallback Validator**: Server-side syntax sanitizer that strips rogue markdown fences, normalizes node labels, removes trailing semicolons, verifies bracket balance, and falls back to a graceful structural diagram if malformed syntax is detected.
- **Contextual Codebase Chat ("Ask AI")**: Interactive conversational assistant grounded in the repository's structured analysis, module breakdown, and architecture diagram. Delivers concise technical answers, source code citations with file paths, and dynamically suggested follow-up questions.
- **Architecture Evolution & Version Diff**: Semantic git comparison engine that inspects file deltas between any two branches or release tags. Analyzes added, modified, and removed files using Gemini to identify architectural impact levels (High/Medium/Low), breaking changes, and migration guidelines.
- **Health & Security Scorecard**: Automated multi-dimensional quality audit grading repositories from A+ to F across four core pillars: Modularity, Documentation Quality, Maintainability, and Security & Quality Posture.
- **Multi-Ecosystem Dependency Graph**: Automated parser for `package.json` (npm), `Cargo.toml` (Rust), `go.mod` (Go), and `pyproject.toml` (Python) that categorizes packages into production and development dependencies with ecosystem badges and search filtering.
- **Branch & Release Tag Selector**: Dynamic ref switcher fetching up to 100 branches and 50 tags via GitHub REST API, enabling precise point-in-time architectural audits across historical releases.
- **Progressive Multi-Stage Loading Telemetry**: Real-time stage progress indicator tracking analysis milestones: `fetching_repo` (15%) → `selecting_files` (35%) → `analyzing` (65%) → `validating` (90%) → `done` (100%).
- **Recent Analyses History Feed**: Real-time showcase of recently analyzed repositories with direct re-load capability, language indicators, star counts, and timestamp badges.
- **Smart Rate-Limit & Error Boundary Guardrails**: Proactive detection of GitHub API rate limits (surfacing remaining quota headers), private repository access barriers, repository size ceilings (>500MB), and invalid URL handling.

## Tech Stack

### Frontend
- **Next.js 16 (App Router)**: Modern React 19 framework leveraging Server Components, Client Components, and optimized streaming.
- **React 19 & TypeScript 5**: Strict type safety across all analysis schemas, UI components, and API contracts.
- **Tailwind CSS v4 & PostCSS**: Custom design tokens, dark-mode surfaces, glassmorphic accents, and fluid layouts.
- **Mermaid.js 11**: Client-side diagram rendering engine customized with dark slate theme variables.
- **Lucide React**: Clean, consistent icon set for development and auditing indicators.
- **clsx & tailwind-merge**: Dynamic utility class merging and conditional styling.

### Backend
- **Next.js Route Handlers**: RESTful API endpoints for repository analysis, diffing, chat sessions, ref listing, and health checks.
- **Google Generative AI SDK (`@google/generative-ai`)**: Gemini 1.5 Flash client with low temperature (0.2) and JSON schema constraints.
- **pg (node-postgres)**: Connection pool client with auto-reconnecting singleton pool and parameterized queries.
- **PostgreSQL 14+**: Relational data store utilizing `pgcrypto` UUIDs, JSONB storage for complex analysis trees, and indexed queries.

### External Services & APIs
- **GitHub REST API (v2022-11-28)**: Ingests repository metadata, commit history, recursive Git trees, and compare diffs.
- **Google AI Studio / Gemini API**: Multi-stage semantic reasoning, architectural synthesis, and chat grounding.

## System Architecture

The application is structured into a clean decoupled pipeline separating client visualization, Next.js server-side orchestration, LLM reasoning, GitHub API ingestion, and PostgreSQL persistent caching.

```mermaid
graph TD
    subgraph Client ["Frontend (Next.js 16 / React 19)"]
        UI["Dashboard & Input Bar"]
        Stage["Progressive Stage Loader"]
        Viewer["Mermaid Diagram Canvas (Zoom/Pan)"]
        Explorer["Module & Code Explainer Tree"]
        ChatUI["Contextual Codebase Chatbot"]
        DiffUI["Architecture Evolution & Version Diff"]
        ScoreUI["Health Scorecard & Dependency Graph"]
    end

    subgraph API ["Next.js Server API Layer"]
        AnalyzeRoute["/api/analyze (Orchestrator)"]
        DiffRoute["/api/analyze/diff (Version Diff)"]
        ChatRoute["/api/chat (Grounded Assistant)"]
        RefsRoute["/api/refs (Branch/Tag Fetcher)"]
        RecentRoute["/api/analyze/recent (History Feed)"]
        ReportRoute["/api/report (Cache Fetcher)"]
    end

    subgraph Engine ["Core Processing Engine"]
        GitClient["GitHub REST Client"]
        FileSelector["Multi-Tier File Selector (80k Budget)"]
        GeminiClient["Gemini 1.5 Flash Analyzer"]
        Sanitizer["Mermaid Syntax Sanitizer"]
        DepParser["Multi-Ecosystem Dependency Parser"]
    end

    subgraph Storage ["Storage & External Providers"]
        Postgres[(PostgreSQL Cache / JSONB)]
        GitHubAPI[GitHub REST API]
        GeminiAPI[Google Gemini API]
    end

    UI --> Stage
    Stage --> AnalyzeRoute
    AnalyzeRoute --> Postgres
    AnalyzeRoute --> GitClient
    GitClient --> GitHubAPI
    GitClient --> FileSelector
    FileSelector --> GeminiClient
    GeminiClient --> GeminiAPI
    GeminiClient --> Sanitizer
    AnalyzeRoute --> DepParser
    AnalyzeRoute --> Postgres
    AnalyzeRoute --> UI

    Viewer <--> UI
    Explorer <--> UI
    ChatUI <--> ChatRoute
    ChatRoute --> GeminiAPI
    DiffUI <--> DiffRoute
    DiffRoute --> GitHubAPI
    DiffRoute --> GeminiAPI
    ScoreUI <--> UI
    UI <--> RefsRoute
    UI <--> RecentRoute
    RecentRoute --> Postgres
```

## Module Dependency

The backend execution flow follows a deterministic lifecycle from URL validation and cache verification down to file selection, model generation, diagram sanitization, and database indexing.

```mermaid
graph LR
    subgraph Ingestion_Flow ["Repository Ingestion Flow"]
        URL[Input URL] --> Validate[URL & Auth Validation]
        Validate --> GitMeta[Fetch Repo Meta & SHA]
        GitMeta --> CacheCheck{Cache Hit?}
        CacheCheck -- Yes --> ServeCache[Serve Cached Analysis <10ms]
        CacheCheck -- No --> FetchTree[Recursive Git Tree Fetch]
    end

    subgraph Processing_Flow ["Synthesis & Validation Pipeline"]
        FetchTree --> TierFilter[Multi-Tier File Selector]
        TierFilter --> BudgetCap[80k Token Budget Capping]
        BudgetCap --> GeminiEngine[Gemini 1.5 Flash Analysis]
        GeminiEngine --> DiagramClean[Mermaid Syntax Sanitizer]
        GeminiEngine --> ParseDeps[Dependency Graph Extraction]
    end

    subgraph Storage_Flow ["Persistence & Delivery"]
        DiagramClean --> UpsertDB[(PostgreSQL JSONB Upsert)]
        ParseDeps --> UpsertDB
        UpsertDB --> Deliver[Deliver Analysis Result to Client]
    end
```

## Project Structure

```
github-repo-explainer/
├── app/                              # Next.js 16 App Router directory
│   ├── api/                          # Serverless REST API route handlers
│   │   ├── analyze/                  # Repository analysis orchestration
│   │   │   ├── diff/                 # Version comparison & evolution endpoint
│   │   │   │   └── route.ts          # POST — git compare + Gemini diff reasoning
│   │   │   ├── recent/               # Analysis history feed
│   │   │   │   └── route.ts          # GET — returns 10 latest cached analyses
│   │   │   └── route.ts              # POST — main pipeline: fetch, select, analyze, cache
│   │   ├── chat/                     # Contextual codebase assistant
│   │   │   └── route.ts              # POST — grounded Q&A with citation extraction
│   │   ├── health/                   # Infrastructure health check
│   │   │   └── route.ts              # GET — database connection & uptime check
│   │   ├── refs/                     # Git reference selector
│   │   │   └── route.ts              # GET — branches and tags listing with fuzzy search
│   │   └── report/                   # Direct analysis lookup
│   │       └── route.ts              # GET — fetch analysis by repo name and commit SHA
│   ├── globals.css                   # Tailwind v4 theme variables, design system tokens
│   ├── layout.tsx                    # Root layout with Geist font injection & metadata
│   └── page.tsx                      # Main dashboard with 7-tab interactive workspace
├── components/                       # Client & server UI components
│   ├── branch-ref-selector.tsx       # Branch and tag picker dropdown with search
│   ├── codebase-chat.tsx             # Interactive chatbot with citations & suggested prompts
│   ├── code-explainer.tsx            # Tree navigation + module & file purpose inspector
│   ├── dependency-graph.tsx          # Multi-ecosystem package manifest visualizer
│   ├── diagram-viewer.tsx            # Mermaid SVG renderer with zoom, pan, and fullscreen
│   ├── health-scorecard.tsx          # 4-category architectural audit & security panel
│   ├── metadata-badge-bar.tsx        # Stars, language, forks, branch, and commit badges
│   ├── onboarding-guide.tsx          # Setup commands, reading paths, and conventions
│   ├── recent-analyses.tsx           # Recent repo cards with 1-click re-analysis
│   ├── share-export-modal.tsx        # Export modal for Markdown, JSON, SVG, and badges
│   ├── stage-loader.tsx              # Progressive step-by-step telemetry progress bar
│   └── version-diff-viewer.tsx       # Branch-to-branch architectural evolution comparison
├── db/                               # Database schemas and initialization
│   └── schema.sql                    # PostgreSQL idempotent schema with triggers & indexes
├── lib/                              # Core domain logic, external clients, and utilities
│   ├── db/                           # Database client abstraction
│   │   └── client.ts                 # pg Pool singleton with connection management
│   ├── export/                       # Export document generation
│   │   └── report-generator.ts       # Markdown report and README badge generators
│   ├── gemini/                       # Google Gemini API integration
│   │   ├── analyzer.ts               # Primary repository analyzer calling Gemini 1.5 Flash
│   │   ├── health-evaluator.ts       # Architecture health scorecard evaluator & prompts
│   │   ├── mermaid-validator.ts      # Server-side Mermaid diagram validator & sanitizer
│   │   └── prompts.ts                # System prompts, JSON schemas, and response parsers
│   └── github/                       # GitHub REST API integration
│       ├── client.ts                 # Repo metadata, commit SHA, and tree fetchers
│       ├── dependency-parser.ts      # Parsers for package.json, Cargo.toml, go.mod, pyproject
│       └── file-selector.ts          # Heuristic 3-tier file selector with 80k token budget
├── types/                            # Core TypeScript interface definitions
│   └── index.ts                      # AnalysisResult, RepoInfo, HealthScorecard, Diff, Chat
├── .env.example                      # Environment variables reference template
├── package.json                      # Project manifest, dependencies, and build scripts
└── README.md                         # Project documentation
```

## API Documentation Overview

The backend follows RESTful conventions across all route handlers:

*   **Analysis Execution**: `POST /api/analyze` — Initiates analysis for a given GitHub repository URL. Checks the PostgreSQL cache unless `forceReanalyze: true` is passed.
*   **Version Comparison**: `POST /api/analyze/diff` — Compares two Git references (branches or tags) via GitHub's compare API and synthesizes architectural deltas with Gemini.
*   **Contextual Chat**: `POST /api/chat` — Submits a developer question grounded in the repository's architecture summary, module tree, and onboarding guide; returns structured answers, file citations, and suggested follow-ups.
*   **Recent Analyses**: `GET /api/analyze/recent` — Retrieves the 10 most recently analyzed repositories with metadata, commit SHAs, and timestamp records.
*   **Cached Report Lookup**: `GET /api/report?repo={owner/repo}&sha={commitSha}` — Fetches an exact cached analysis record by repository full name and commit SHA.
*   **Git Reference Listing**: `GET /api/refs?repo={owner/repo}` — Returns up to 100 branches and 50 tags for a repository to populate branch selectors.
*   **Health & Readiness**: `GET /api/health` — Verifies database connectivity and returns service status.

## Performance Benchmarks

### Ingestion & Analysis Latency
- **Cache Hit (PostgreSQL)**: < 10ms (instant delivery of complete architecture summary, diagram, and modules)
- **Cache Miss (Full Analysis Pipeline)**: 8–15 seconds total:
  - GitHub metadata & tree resolution: 1–2 seconds
  - Multi-tier file content fetching: 2–3 seconds
  - Gemini 1.5 Flash architectural synthesis: 4–8 seconds
  - Mermaid validation & DB upsert: < 100ms
- **Version Diffing**: 3–6 seconds for two-branch comparison and semantic impact assessment
- **Contextual Chat Response**: 1.5–3 seconds per grounded query with JSON schema validation

### File Selection & Token Optimization
- **Token Budget Limit**: 80,000 tokens maximum (~320 KB UTF-8 text)
- **Per-File Size Cap**: 50 KB maximum to prevent single large files from dominating context
- **Maximum File Count**: 35 curated files prioritized across Tier 1, Tier 2, and Tier 3
- **Exclusion Filters**: Automatically prunes binary files, images, minified assets, lockfiles, `.git`, `node_modules`, and build targets

### Database & Connection Performance
- **Connection Pool**: 10 clients with 30s idle timeout and 5s connection timeout
- **Index Optimization**: Composite index on `(repo_full_name, commit_sha)` ensures O(1) cache lookups
- **Storage Efficiency**: High-density JSONB columns allow structured indexing without relational sprawl

## Features in Detail

### Multi-Tier Smart File Selector
Analyzing an entire multi-gigabyte repository inside an LLM context window is cost-prohibitive and introduces signal noise. ATLAS implements an intelligent 3-tier priority heuristic:
- **Tier 1 (Manifests & Architecture Meta)**: Captures `package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `pom.xml`, `Dockerfile`, `docker-compose.yml`, `Makefile`, `.env.example`, and `README.md`.
- **Tier 2 (Entry Points & Core Routing)**: Captures root application entry points such as `src/index.ts`, `src/main.rs`, `app/layout.tsx`, `app/page.tsx`, `next.config.js`, and `vite.config.ts`.
- **Tier 3 (Shallow Domain Modules)**: Selects top-level logic modules, prioritizing shallower directory depth and compact file size to maximize architectural coverage within the 80k token envelope.

### Google Gemini 1.5 Flash Structured Synthesis
The analysis engine leverages Gemini 1.5 Flash with strict `application/json` output mime typing:
- **Low Temperature (0.2)**: Ensures deterministic, factual architectural analysis without speculative hallucination.
- **Strict JSON Schema**: Guarantees the output structure contains typed fields for architecture overview, tech stack array, core concepts, Mermaid syntax, module explanations with file-level purpose breakdowns, and setup steps.
- **Deep-Linked File References**: Automatically constructs exact permalinks (`https://github.com/{owner}/{repo}/blob/{commitSha}/{filePath}`) for all identified spotlight files and module components.

### Mermaid Diagram Sanitizer & Fallback
Raw LLM-generated Mermaid diagrams frequently suffer from unescaped characters, unbalanced brackets, or trailing semicolons that crash client-side renderers. ATLAS applies a server-side sanitization layer:
- Strips markdown code fences (` ```mermaid `).
- Enforces valid graph directives (defaults to `graph TD`).
- Normalizes semicolons and escapes nested parenthesis in node labels.
- Validates bracket balance and minimum length thresholds.
- Automatically substitutes a clean fallback architectural diagram if the generated syntax fails validation.

### Contextual Codebase Chat ("Ask AI")
A specialized Q&A module embedded directly into the repository workspace:
- **Architecture-Grounded**: Passes the complete module tree, technical overview, and onboarding conventions into Gemini's system instruction.
- **Citation Extraction**: Identifies mentioned files in the generated answer and formats them into clickable citation pills.
- **Proactive Follow-Ups**: Suggests 3 logical next questions based on the developer's conversation flow.

### Architecture Evolution & Version Diff
Allows engineering leads to track how a codebase has evolved across releases:
- Compares any two branches, tags, or commit SHAs using the GitHub compare API.
- Aggregates added, removed, and modified files.
- Uses Gemini to synthesize a human-readable evolutionary summary, classify module impacts (High, Medium, Low), detect breaking changes, and outline migration steps.

### Health & Security Scorecard
An automated audit panel evaluating code quality across four core dimensions:
1. **Modularity**: Measures separation of concerns and interface boundaries.
2. **Documentation**: Audits README completeness, configuration guides, and inline documentation.
3. **Maintainability**: Evaluates convention adherence, package manifest cleanliness, and file organization.
4. **Security & Quality**: Checks for committed secrets, sensitive file exclusions, and security guidelines.

### Multi-Ecosystem Dependency Parser
Parses package configurations without external network calls:
- Supports npm/yarn/pnpm (`package.json`), Rust (`Cargo.toml`), Go (`go.mod`), and Python (`pyproject.toml`).
- Automatically categorizes packages into runtime (direct) and tooling (dev).
- Features instant client-side search and category filtering.

## Development Roadmap

### Phase 1: Foundation (Completed)
- Next.js 16 App Router foundation with TypeScript and Tailwind CSS v4 design system.
- GitHub REST API client for repository metadata, branch resolution, and Git trees.
- PostgreSQL database integration with connection pooling and idempotent schema migrations.

### Phase 2: Synthesis Engine (Completed)
- Google Gemini 1.5 Flash integration with structured JSON schema constraints.
- Heuristic 3-tier file selection algorithm respecting 80k token budget caps.
- Commit SHA-pinned analysis caching in PostgreSQL (`repo_analyses` table).

### Phase 3: Visual & Onboarding Suite (Completed)
- Mermaid.js dark-themed dynamic diagram canvas with pan, zoom, and fullscreen capabilities.
- Server-side Mermaid diagram validator and syntax sanitizer with fallback protection.
- Module-by-module code explorer with expandable directory trees and deep-linked GitHub URLs.
- Onboarding guide with runtime prerequisites, manifest-derived setup commands, and curated reading order.

### Phase 4: Intelligence & Interactive Chat (Completed)
- Contextual Codebase Chat (`/api/chat`) grounded in structured repository analysis.
- Automatic file citation extraction and interactive suggested follow-up questions.
- Dynamic stage-by-stage progressive loading indicator tracking analysis percentage.

### Phase 5: Audit & Dependency Engine (Completed)
- Health & Security Scorecard evaluating Modularity, Documentation, Maintainability, and Security.
- Multi-ecosystem dependency parser supporting npm, Cargo, Go, and pip manifests.
- Multi-format export modal supporting Markdown reports, JSON payloads, SVG diagrams, and README badges.

### Phase 6: Architecture Evolution & Version Diffing (Completed)
- Branch & Tag reference selector (`/api/refs`) fetching up to 100 branches and 50 tags.
- Architecture Evolution engine (`/api/analyze/diff`) comparing branches with breaking change detection.
- Recent analyses history feed (`/api/analyze/recent`) with one-click re-analysis.

## Getting Started

### Prerequisites
- **Node.js**: Version 20.0.0 or higher
- **PostgreSQL**: Version 14 or higher (with `psql` command line tool available)
- **Google AI Studio API Key**: Required for Gemini 1.5 Flash models ([Get an API Key](https://aistudio.google.com/))
- **GitHub Personal Access Token (PAT)**: Optional, but raises GitHub API rate limits from 60 to 5,000 requests per hour ([Create a Token](https://github.com/settings/tokens))

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Giancyril/Atlas.git
cd Atlas
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Populate the required configuration values:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/atlas"

# GitHub Personal Access Token (strongly recommended)
GITHUB_TOKEN="ghp_your_github_token_here"

# Google Gemini API Key
GEMINI_API_KEY="AIzaSy_your_gemini_api_key_here"
```

### 3. Initialize the Database Schema

Run the idempotent schema file against your PostgreSQL instance:

```bash
psql -U postgres -c "CREATE DATABASE atlas;"
psql -U postgres -d atlas -f db/schema.sql
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser, enter any public GitHub repository URL (e.g. `https://github.com/expressjs/express`), and initiate the analysis.

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection URI (`postgresql://user:pass@host:port/db`) |
| `GEMINI_API_KEY` | **Yes** | — | Google AI Studio API key used for architectural synthesis and chat |
| `GITHUB_TOKEN` | *Recommended* | `undefined` | GitHub PAT to elevate rate limits from 60 req/hr to 5,000 req/hr |

## License

This project is licensed under the [MIT License](./LICENSE).
