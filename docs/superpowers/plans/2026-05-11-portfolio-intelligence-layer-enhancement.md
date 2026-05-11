# Portfolio Intelligence Layer Enhancement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 9 new projects to DEMO_PROJECTS and enhance the UI with category/health filtering, category badges, per-card GitHub links, last-commit display, and a stack breakdown chart in the sidebar.

**Architecture:** Extend `ProjectSignal` with `category` and `githubUrl` fields in the library; expand DEMO_PROJECTS from 3 → 12 entries; extract all card/sidebar/filter UI into a new `"use client"` component `ProjectList` so filter state lives client-side while the server page stays a thin data-fetching shell.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS 4, lucide-react 1.x

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `src/lib/project-intelligence.ts` | Add `category` + `githubUrl` to type; expand DEMO_PROJECTS; add `inferGithubUrl` + `inferCategory`; wire into `readProjectSignal` |
| Create | `src/app/components/project-list.tsx` | `"use client"` component: filter state, filter pills, sidebar (readiness + stack chart), project card grid |
| Modify | `src/app/page.tsx` | Remove sidebar/cards/helpers that move to `project-list.tsx`; render `<ProjectList projects={projects} />` |

---

## Task 1: Extend `ProjectSignal` type with `category` and `githubUrl`

**Files:**
- Modify: `src/lib/project-intelligence.ts`

- [ ] **Step 1.1: Add fields to the `ProjectSignal` type**

In `src/lib/project-intelligence.ts`, replace the `ProjectSignal` type (currently ends at `updatedAt`) with:

```typescript
export type ProjectSignal = {
  name: string;
  path: string;
  relativePath: string;
  description: string;
  latestCommits: CommitSignal[];
  activeBranches: BranchSignal[];
  unfinishedFeatures: string[];
  deployment: DeploymentSignal;
  screenshots: ScreenshotSignal[];
  stack: string[];
  caseStudyStatus: "ready" | "draft" | "missing";
  proves: string[];
  health: "active" | "needs-case-study" | "quiet" | "needs-git";
  updatedAt: string | null;
  category: "Web" | "AI" | "Mobile" | "Data" | "Automation" | "Tools";
  githubUrl: string | null;
};
```

- [ ] **Step 1.2: Verify TypeScript sees the new fields**

```bash
cd /Users/arnavgokhale/Projects/portfolio-intelligence-layer
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors about DEMO_PROJECTS entries missing `category` and `githubUrl` — that's correct, Task 2 fixes them. No other errors.

---

## Task 2: Expand DEMO_PROJECTS to 12 entries

**Files:**
- Modify: `src/lib/project-intelligence.ts`

- [ ] **Step 2.1: Update the three existing DEMO entries with `category` and `githubUrl`**

Find the `const DEMO_PROJECTS: ProjectSignal[] = [` array. Add `category` and `githubUrl` to the three existing entries:

```typescript
// portfolio-intelligence-layer entry — add these two fields:
category: "Web",
githubUrl: "https://github.com/arnavgokhale12/portfolio-intelligence-layer",

// cortex entry — add these two fields:
category: "AI",
githubUrl: "https://github.com/arnavgokhale12/cortex",

// lexistack entry — add these two fields:
category: "Mobile",
githubUrl: "https://github.com/arnavgokhale12/vocab-phone",
```

- [ ] **Step 2.2: Append 9 new entries to DEMO_PROJECTS**

Add the following entries before the closing `];` of the `DEMO_PROJECTS` array:

```typescript
  {
    name: "automation-frontier",
    path: "/demo/automation-frontier",
    relativePath: "automation-frontier",
    description:
      "Job automation risk dashboard tracking how AI and robotics exposure affects roles across industries, with a composite stress index and market overlays.",
    latestCommits: [
      { hash: "d93c556", subject: "Improve automation dashboard UX", author: "arnavgokhale", date: "2026-05-10T23:08:05-05:00" },
      { hash: "84b45a8", subject: "fix: correct automationRisk values in seed data and harden API route", author: "arnavgokhale", date: "2026-05-10T18:04:59-05:00" },
      { hash: "c2a2fd2", subject: "chore: production build verified and deployed", author: "arnavgokhale", date: "2026-05-10T18:00:58-05:00" },
    ],
    activeBranches: [
      { name: "feature/human-bottleneck-index", isCurrent: true },
      { name: "main", isCurrent: false },
    ],
    unfinishedFeatures: ["Human Bottleneck Index feature in progress on active branch"],
    deployment: {
      status: "configured",
      url: null,
      provider: "vercel",
      note: "Linked to Vercel. Production build verified and deployed.",
    },
    screenshots: [],
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    caseStudyStatus: "missing",
    proves: [
      "Can build labor economics dashboards with real automation risk data.",
      "Can ship Next.js apps with server-rendered composite indexes.",
      "Can maintain active feature branches alongside production.",
      "Shows ownership of automation-frontier from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-05-10T23:08:05-05:00",
    category: "Web",
    githubUrl: "https://github.com/arnavgokhale12/automation-frontier",
  },
  {
    name: "bluesky-autoposter",
    path: "/demo/bluesky-autoposter",
    relativePath: "bluesky-autoposter",
    description:
      "Daily Bluesky poster driven by GitHub Actions — posts from a queue and auto-announces portfolio projects via the AT Protocol SDK, with per-project dedup tracking.",
    latestCommits: [
      { hash: "5d8fdc8", subject: "Update social posting state", author: "GitHub Action", date: "2026-05-11T04:03:02Z" },
      { hash: "a55fc54", subject: "Add portfolio project autoposting", author: "arnavgokhale", date: "2026-05-10T23:02:30-05:00" },
      { hash: "5ded5b2", subject: "Mark post as completed", author: "GitHub Action", date: "2026-05-08T14:35:09Z" },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [],
    deployment: {
      status: "unknown",
      url: null,
      provider: "unknown",
      note: "Runs as a GitHub Actions workflow — no web deployment.",
    },
    screenshots: [],
    stack: ["Python", "GitHub Actions", "AT Protocol"],
    caseStudyStatus: "missing",
    proves: [
      "Can build social media automation with the AT Protocol SDK.",
      "Can orchestrate multi-source post queues via GitHub Actions.",
      "Can integrate portfolio project discovery into a publishing pipeline.",
      "Shows ownership of bluesky-autoposter from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-05-11T04:03:02Z",
    category: "Automation",
    githubUrl: "https://github.com/arnavgokhale12/bluesky-autoposter",
  },
  {
    name: "ghrm",
    path: "/demo/ghrm",
    relativePath: "ghrm",
    description:
      "GitHub contribution calendar keeper — commits a heartbeat timestamp once or twice daily via GitHub Actions with randomized timing and commit message variation.",
    latestCommits: [
      { hash: "2f577b5", subject: "Ignore Vercel project files", author: "arnavgokhale", date: "2026-05-10T23:08:41-05:00" },
      { hash: "9ba9e38", subject: "Update activity", author: "arnavgokhale12", date: "2026-05-10T18:38:44Z" },
      { hash: "42a7089", subject: "Regular check-in", author: "arnavgokhale12", date: "2026-05-10T09:43:46Z" },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [],
    deployment: {
      status: "unknown",
      url: null,
      provider: "unknown",
      note: "Runs as a scheduled GitHub Actions workflow — no web interface.",
    },
    screenshots: [],
    stack: ["Python", "GitHub Actions"],
    caseStudyStatus: "missing",
    proves: [
      "Can build reliable GitHub Actions automation with Python.",
      "Can design randomized scheduling for natural-looking bot behavior.",
      "Shows ownership of ghrm from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-05-10T23:08:41-05:00",
    category: "Automation",
    githubUrl: "https://github.com/arnavgokhale12/ghrm",
  },
  {
    name: "groupme-mcp",
    path: "/demo/groupme-mcp",
    relativePath: "groupme-mcp",
    description:
      "MCP server wrapping the GroupMe v3 API — lets Claude and other AI assistants read messages, send to groups, and manage direct chats natively.",
    latestCommits: [
      { hash: "7830371", subject: "Initial commit: GroupMe MCP server", author: "arnavgokhale", date: "2026-04-15T12:53:59-05:00" },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [],
    deployment: {
      status: "unknown",
      url: null,
      provider: "unknown",
      note: "Installed locally as a Claude MCP server — no public deployment.",
    },
    screenshots: [],
    stack: ["Python", "MCP"],
    caseStudyStatus: "missing",
    proves: [
      "Can extend AI assistants with custom MCP tool servers.",
      "Can wrap third-party REST APIs into AI-native interfaces.",
      "Shows ownership of groupme-mcp from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-04-15T12:53:59-05:00",
    category: "Tools",
    githubUrl: "https://github.com/arnavgokhale12/groupme-mcp",
  },
  {
    name: "BAYC",
    path: "/demo/BAYC",
    relativePath: "BAYC",
    description:
      "BAYC-inspired generative NFT gallery with a programmatic Canvas art engine, layered PNG compositor, rarity system, slot-machine mint animation, Web3 wallet connect, and Web Audio synthesizer.",
    latestCommits: [
      { hash: "82daead", subject: "Update deployment ignore and lockfile", author: "arnavgokhale", date: "2026-05-10T23:08:29-05:00" },
      { hash: "9b766b3", subject: "Replace programmatic Canvas engine with PNG layer compositor", author: "arnavgokhale", date: "2026-04-10T13:15:53-05:00" },
      { hash: "490a3c1", subject: "Add Web3 wallet connect flow", author: "arnavgokhale", date: "2026-04-10T12:40:32-05:00" },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [],
    deployment: {
      status: "unknown",
      url: null,
      provider: "unknown",
      note: "Fully client-side static site — no backend or external services.",
    },
    screenshots: [],
    stack: ["HTML Canvas", "JavaScript", "Web Audio API", "Web3"],
    caseStudyStatus: "missing",
    proves: [
      "Can build generative art systems with programmable trait engines.",
      "Can implement Web3 wallet connect without a backend.",
      "Can synthesize audio and build immersive browser experiences.",
      "Shows ownership of BAYC from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-05-10T23:08:29-05:00",
    category: "Web",
    githubUrl: "https://github.com/arnavgokhale12/BAYC",
  },
  {
    name: "supply-chain-dashboard",
    path: "/demo/supply-chain-dashboard",
    relativePath: "supply-chain-dashboard",
    description:
      "Real-time supply chain stress monitoring with a composite index from FRED, GSCPI, Baltic Dry, and Cass Freight data, plus equity market overlays for sector performance under stress regimes.",
    latestCommits: [
      { hash: "dd26888", subject: "Fix render.yaml: remove unsupported pythonVersion field", author: "arnavgokhale", date: "2026-04-09T19:50:50-05:00" },
      { hash: "84a6c78", subject: "Add deployment configs for Render + Streamlit Community Cloud", author: "arnavgokhale", date: "2026-04-09T17:53:57-05:00" },
      { hash: "58cbd8b", subject: "Add daily data refresh scheduling", author: "Arnav Gokhale", date: "2026-01-14T17:35:11-06:00" },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [],
    deployment: {
      status: "configured",
      url: null,
      provider: "unknown",
      note: "Deployment configs for Render (FastAPI backend) and Streamlit Community Cloud added.",
    },
    screenshots: [],
    stack: ["Python", "FastAPI", "Streamlit", "SQLAlchemy", "Pandas", "yfinance"],
    caseStudyStatus: "missing",
    proves: [
      "Can ingest and normalize multi-source macroeconomic time-series data.",
      "Can build composite financial stress indexes from raw API feeds.",
      "Can deploy fullstack Python apps with persistent databases.",
      "Shows ownership of supply-chain-dashboard from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-04-09T19:50:50-05:00",
    category: "Data",
    githubUrl: "https://github.com/arnavgokhale12/supply-chain-dashboard",
  },
  {
    name: "euro-style-clusters",
    path: "/demo/euro-style-clusters",
    relativePath: "euro-style-clusters",
    description:
      "Playing style clustering and MoneyBall transfer market efficiency analysis for Europe's top 5 football leagues, using PCA, K-means, and an interactive Streamlit UI.",
    latestCommits: [
      { hash: "7bf4a72", subject: "Fix KeyError crash when avg_possession column is absent", author: "arnavgokhale", date: "2026-04-09T19:34:10-05:00" },
      { hash: "8a737c8", subject: "Prepare for Streamlit Community Cloud deployment", author: "arnavgokhale", date: "2026-04-09T17:49:54-05:00" },
      { hash: "fa2b81d", subject: "Add screenshots to README", author: "arnavgokhale", date: "2026-01-13T11:16:20-06:00" },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [],
    deployment: {
      status: "configured",
      url: null,
      provider: "unknown",
      note: "Prepared for Streamlit Community Cloud — no confirmed live URL.",
    },
    screenshots: [],
    stack: ["Python", "Streamlit", "Pandas", "scikit-learn", "Matplotlib"],
    caseStudyStatus: "missing",
    proves: [
      "Can apply unsupervised ML to domain-specific sports analytics data.",
      "Can visualize multidimensional clustering results accessibly.",
      "Can tell a MoneyBall-style story through quantitative analysis.",
      "Shows ownership of euro-style-clusters from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-04-09T19:34:10-05:00",
    category: "Data",
    githubUrl: "https://github.com/arnavgokhale12/euro-style-clusters",
  },
  {
    name: "self-rpg",
    path: "/demo/self-rpg",
    relativePath: "self-rpg",
    description:
      "Gamified habit tracker that turns to-do items into RPG quests — earn XP, level up character stats, and track real-life progress through a browser-based dashboard.",
    latestCommits: [
      { hash: "7caf73e", subject: "Ignore Vercel project files", author: "arnavgokhale", date: "2026-05-10T23:08:41-05:00" },
      { hash: "b2102b0", subject: "Build life stats RPG dashboard — full web app", author: "arnavgokhale", date: "2026-04-09T17:50:17-05:00" },
      { hash: "14f5761", subject: "add gitignore", author: "arnavgokhale", date: "2026-04-09T17:37:59-05:00" },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [],
    deployment: {
      status: "unknown",
      url: null,
      provider: "unknown",
      note: "Fully client-side static site — open index.html in any browser.",
    },
    screenshots: [],
    stack: ["HTML", "CSS", "JavaScript"],
    caseStudyStatus: "missing",
    proves: [
      "Can gamify abstract productivity concepts into interactive UX.",
      "Can build fully featured browser apps without a framework.",
      "Shows ownership of self-rpg from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-05-10T23:08:41-05:00",
    category: "Web",
    githubUrl: "https://github.com/arnavgokhale12/self-rpg",
  },
  {
    name: "x-autoposter",
    path: "/demo/x-autoposter",
    relativePath: "x-autoposter",
    description:
      "Playwright-driven X (Twitter) autoposter with browser session persistence, interval scheduling, and zero dependency on the official API.",
    latestCommits: [
      { hash: "eb6bb60", subject: "Initial commit: X/Twitter autoposter bot", author: "arnavgokhale", date: "2026-04-12T16:32:46-05:00" },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [],
    deployment: {
      status: "unknown",
      url: null,
      provider: "unknown",
      note: "Runs locally — no server deployment.",
    },
    screenshots: [],
    stack: ["Python", "Playwright"],
    caseStudyStatus: "missing",
    proves: [
      "Can automate browser-based tasks without official API access.",
      "Can build modular Python CLI tools with session management.",
      "Shows ownership of x-autoposter from code to narrative.",
    ],
    health: "needs-case-study",
    updatedAt: "2026-04-12T16:32:46-05:00",
    category: "Automation",
    githubUrl: "https://github.com/arnavgokhale12/x-autoposter",
  },
```

- [ ] **Step 2.3: Verify TypeScript is satisfied**

```bash
cd /Users/arnavgokhale/Projects/portfolio-intelligence-layer
npx tsc --noEmit 2>&1 | head -30
```

Expected: only errors related to live-mode functions that haven't been updated yet (`readProjectSignal` return object missing `category` and `githubUrl`). No DEMO_PROJECTS errors.

---

## Task 3: Live-mode inference — `inferGithubUrl` + `inferCategory`

**Files:**
- Modify: `src/lib/project-intelligence.ts`

- [ ] **Step 3.1: Add `inferGithubUrl` function**

Add this function after the `git()` helper (around line 292):

```typescript
async function inferGithubUrl(projectPath: string): Promise<string | null> {
  const remote = await git(projectPath, ["remote", "get-url", "origin"]);
  if (!remote || !remote.includes("github.com")) return null;
  return remote.replace(/\.git$/, "").trim();
}
```

- [ ] **Step 3.2: Add `inferCategory` function**

Add this function directly after `inferGithubUrl`:

```typescript
function inferCategory(stack: string[]): ProjectSignal["category"] {
  const s = stack.map((t) => t.toLowerCase());
  if (s.some((t) => ["vercel ai sdk", "ai sdk", "@ai-sdk", "openai", "anthropic", "langchain"].some((kw) => t.includes(kw)))) return "AI";
  if (s.some((t) => ["react native", "expo", "ios", "android"].some((kw) => t.includes(kw)))) return "Mobile";
  if (s.some((t) => ["streamlit", "pandas", "numpy", "scikit-learn", "matplotlib", "plotly"].some((kw) => t.includes(kw)))) return "Data";
  if (s.some((t) => ["playwright", "github actions", "automation", "cron", "bot", "scheduler"].some((kw) => t.includes(kw)))) return "Automation";
  if (s.some((t) => ["mcp", "model context protocol"].some((kw) => t.includes(kw)))) return "Tools";
  return "Web";
}
```

- [ ] **Step 3.3: Wire both into `readProjectSignal`**

In `readProjectSignal`, the current `Promise.all` call collects six values. Add `inferGithubUrl` as a seventh:

```typescript
const [commits, branches, description, stack, unfinished, screenshots, githubUrl] =
  await Promise.all([
    hasGit ? readLatestCommits(projectPath) : Promise.resolve([]),
    hasGit ? readBranches(projectPath) : Promise.resolve([]),
    readDescription(projectPath),
    detectStack(projectPath),
    findUnfinishedFeatures(projectPath),
    findScreenshots(projectPath),
    hasGit ? inferGithubUrl(projectPath) : Promise.resolve(null),
  ]);
```

Then update the returned object to include the two new fields (add at the end of the return object in `readProjectSignal`):

```typescript
    category: inferCategory(stack),
    githubUrl,
```

- [ ] **Step 3.4: Verify no TypeScript errors**

```bash
cd /Users/arnavgokhale/Projects/portfolio-intelligence-layer
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

---

## Task 4: Create `src/app/components/project-list.tsx`

**Files:**
- Create: `src/app/components/project-list.tsx`

- [ ] **Step 4.1: Create the file with the full implementation**

```bash
mkdir -p /Users/arnavgokhale/Projects/portfolio-intelligence-layer/src/app/components
```

Create `src/app/components/project-list.tsx` with this complete content:

```tsx
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Camera,
  CircleDot,
  Clock3,
  Code2,
  ExternalLink,
  Github,
  GitBranch,
  GitCommitHorizontal,
  ListChecks,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import type { ProjectSignal } from "@/lib/project-intelligence";

const healthLabels: Record<ProjectSignal["health"], string> = {
  active: "Active",
  "needs-case-study": "Needs case study",
  quiet: "Quiet",
  "needs-git": "Needs Git",
};

const caseStudyLabels: Record<ProjectSignal["caseStudyStatus"], string> = {
  ready: "Ready",
  draft: "Draft",
  missing: "Missing",
};

const categoryColors: Record<ProjectSignal["category"], string> = {
  Web: "border-blue-300/40 bg-blue-300/10 text-blue-100",
  AI: "border-purple-300/40 bg-purple-300/10 text-purple-100",
  Mobile: "border-cyan-300/40 bg-cyan-300/10 text-cyan-100",
  Data: "border-orange-300/40 bg-orange-300/10 text-orange-100",
  Automation: "border-yellow-300/40 bg-yellow-300/10 text-yellow-100",
  Tools: "border-slate-300/40 bg-slate-300/10 text-slate-200",
};

type CategoryFilter = "All" | ProjectSignal["category"];
type HealthFilter = "All" | ProjectSignal["health"];

const CATEGORY_OPTIONS: CategoryFilter[] = [
  "All",
  "Web",
  "AI",
  "Mobile",
  "Data",
  "Automation",
  "Tools",
];

const HEALTH_OPTIONS: { value: HealthFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "active", label: "Active" },
  { value: "needs-case-study", label: "Needs case study" },
  { value: "quiet", label: "Quiet" },
  { value: "needs-git", label: "Needs Git" },
];

export function ProjectList({ projects }: { projects: ProjectSignal[] }) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [activeHealth, setActiveHealth] = useState<HealthFilter>("All");

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        if (activeCategory !== "All" && p.category !== activeCategory) return false;
        if (activeHealth !== "All" && p.health !== activeHealth) return false;
        return true;
      }),
    [projects, activeCategory, activeHealth],
  );

  const topStacks = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      for (const s of p.stack) {
        counts.set(s, (counts.get(s) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [projects]);

  const maxStackCount = topStacks[0]?.[1] ?? 1;
  const liveCount = projects.filter((p) => p.deployment.status === "live").length;
  const caseStudyCount = projects.filter((p) => p.caseStudyStatus === "ready").length;
  const documentedCount = projects.filter((p) => p.unfinishedFeatures.length > 0).length;

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-10">
      <aside className="h-fit space-y-5">
        <div className="border border-white/10 bg-[#12171d] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <CircleDot className="size-4 text-emerald-300" />
            Portfolio Readiness
          </div>
          <div className="mt-4 space-y-4">
            <ProgressRow label="Case studies" value={caseStudyCount} total={projects.length} />
            <ProgressRow label="Live deployments" value={liveCount} total={projects.length} />
            <ProgressRow
              label="Documented next work"
              value={documentedCount}
              total={projects.length}
            />
          </div>
          <div className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-zinc-400">
            Data comes from sibling folders under{" "}
            <code className="font-mono text-zinc-200">PROJECTS_ROOT</code>. Set that env var to
            point this dashboard at a different portfolio workspace.
          </div>
        </div>

        <div className="border border-white/10 bg-[#12171d] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Code2 className="size-4 text-emerald-300" />
            Top technologies
          </div>
          <div className="mt-4 space-y-3">
            {topStacks.map(([tech, count]) => (
              <div key={tech}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="truncate text-zinc-400">{tech}</span>
                  <span className="ml-2 shrink-0 font-mono text-zinc-500">{count}</span>
                </div>
                <div className="h-1.5 bg-zinc-800">
                  <div
                    className="h-full bg-emerald-400/70"
                    style={{ width: `${Math.round((count / maxStackCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="space-y-3 border border-white/10 bg-[#12171d] p-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`border px-3 py-1 text-xs font-medium transition ${
                  activeCategory === cat
                    ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {HEALTH_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveHealth(value)}
                className={`border px-3 py-1 text-xs font-medium transition ${
                  activeHealth === value
                    ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            Showing {filtered.length} of {projects.length}
          </p>
        </div>

        <div className="grid gap-5">
          {filtered.length > 0 ? (
            filtered.map((project) => <ProjectCard key={project.path} project={project} />)
          ) : (
            <div className="border border-white/10 bg-[#12171d] p-8 text-center text-sm text-zinc-500">
              No projects match the current filters.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: ProjectSignal }) {
  const currentBranch = project.activeBranches.find((b) => b.isCurrent);

  return (
    <article className="border border-white/10 bg-[#12171d]">
      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <HealthBadge health={project.health} />
            <CategoryBadge category={project.category} />
            <Badge icon={BadgeCheck}>Case study: {caseStudyLabels[project.caseStudyStatus]}</Badge>
            <Badge icon={Rocket}>{deploymentLabel(project)}</Badge>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{project.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                {project.description}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              {project.deployment.url ? (
                <a
                  href={project.deployment.url}
                  className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-300 hover:text-emerald-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open live
                  <ExternalLink className="size-4" />
                </a>
              ) : null}
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-sm font-medium text-zinc-400 transition hover:border-white/25 hover:text-zinc-200"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                  <Github className="size-4" />
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Panel title="Latest commits" icon={GitCommitHorizontal}>
              <div className="space-y-3">
                {project.latestCommits.length > 0 ? (
                  project.latestCommits.slice(0, 3).map((commit) => (
                    <div key={commit.hash} className="grid gap-1">
                      <div className="truncate text-sm text-zinc-200">{commit.subject}</div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <code>{commit.hash}</code>
                        <span>{formatDate(commit.date)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyLine>No commits found.</EmptyLine>
                )}
              </div>
            </Panel>

            <Panel title="Active branches" icon={GitBranch}>
              <div className="flex flex-wrap gap-2">
                {project.activeBranches.length > 0 ? (
                  project.activeBranches.map((branch, i) => (
                    <span
                      key={`${branch.name}-${i}`}
                      className={`border px-2.5 py-1 text-xs ${
                        branch.isCurrent
                          ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-100"
                          : "border-white/10 bg-white/5 text-zinc-300"
                      }`}
                    >
                      {branch.name}
                    </span>
                  ))
                ) : (
                  <EmptyLine>No branch data.</EmptyLine>
                )}
              </div>
              {currentBranch ? (
                <div className="mt-3 text-xs text-zinc-500">
                  Current:{" "}
                  <code className="font-mono text-zinc-300">{currentBranch.name}</code>
                </div>
              ) : null}
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel title="Unfinished features" icon={ListChecks}>
              <ul className="space-y-2">
                {project.unfinishedFeatures.length > 0 ? (
                  project.unfinishedFeatures.map((feature, i) => (
                    <li key={`${feature}-${i}`} className="text-sm leading-5 text-zinc-300">
                      {feature}
                    </li>
                  ))
                ) : (
                  <EmptyLine>No TODO or roadmap signals found.</EmptyLine>
                )}
              </ul>
            </Panel>

            <Panel title="What this proves" icon={Code2}>
              <ul className="space-y-2">
                {project.proves.map((proof, i) => (
                  <li key={`${proof}-${i}`} className="text-sm leading-5 text-zinc-300">
                    {proof}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="border border-white/10 bg-[#0d1116] p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Camera className="size-4 text-emerald-300" />
              Screenshots
            </div>
            {project.screenshots.length > 0 ? (
              <div className="grid gap-2">
                {project.screenshots.slice(0, 2).map((shot) => (
                  <Image
                    key={shot.absolutePath}
                    src={shot.url}
                    alt={`${project.name} screenshot`}
                    width={520}
                    height={293}
                    unoptimized
                    className="aspect-video w-full object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center border border-dashed border-white/15 bg-white/[0.03] px-4 text-center text-sm text-zinc-500">
                No screenshot asset found yet.
              </div>
            )}
          </div>

          <div className="border border-white/10 bg-[#0d1116] p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
              <Code2 className="size-4 text-emerald-300" />
              Stack used
            </div>
            <div className="flex flex-wrap gap-2">
              {project.stack.length > 0 ? (
                project.stack.map((item, i) => (
                  <span
                    key={`${item}-${i}`}
                    className="bg-white/7 px-2 py-1 text-xs text-zinc-300"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <EmptyLine>No stack detected.</EmptyLine>
              )}
            </div>
          </div>

          <div className="border border-white/10 bg-[#0d1116] p-3 text-sm text-zinc-400">
            <div className="mb-2 flex items-center gap-2 font-medium text-zinc-200">
              <Clock3 className="size-4 text-emerald-300" />
              Status details
            </div>
            <p className="leading-5">{project.deployment.note}</p>
            {project.updatedAt ? (
              <p className="mt-2 text-xs text-zinc-500">
                Last commit: {formatDate(project.updatedAt)}
              </p>
            ) : null}
            <p className="mt-1 font-mono text-xs text-zinc-600">{project.relativePath}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono text-zinc-500">
          {value}/{total}
        </span>
      </div>
      <div className="mt-2 h-2 bg-zinc-800">
        <div className="h-full bg-emerald-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-[#0d1116] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
        <Icon className="size-4 text-emerald-300" />
        {title}
      </div>
      {children}
    </div>
  );
}

function Badge({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300">
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}

function HealthBadge({ health }: { health: ProjectSignal["health"] }) {
  const tone =
    health === "active"
      ? "border-emerald-300/40 bg-emerald-300/10 text-emerald-100"
      : health === "quiet"
        ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
        : "border-sky-300/40 bg-sky-300/10 text-sky-100";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium ${tone}`}
    >
      <Activity className="size-3.5" />
      {healthLabels[health]}
    </span>
  );
}

function CategoryBadge({ category }: { category: ProjectSignal["category"] }) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-xs font-medium ${categoryColors[category]}`}
    >
      {category}
    </span>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-zinc-500">{children}</div>;
}

function deploymentLabel(project: ProjectSignal) {
  if (project.deployment.status === "live") return "Live deployment";
  if (project.deployment.status === "configured") return "Deployment configured";
  return "Deployment unknown";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
```

---

## Task 5: Simplify `src/app/page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 5.1: Replace the entire file**

Replace `src/app/page.tsx` with:

```tsx
import { Activity, ExternalLink, GitBranch, Layers3, ListChecks, Rocket, type LucideIcon } from "lucide-react";
import { getProjectSignals } from "@/lib/project-intelligence";
import { ProjectList } from "@/app/components/project-list";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await getProjectSignals();
  const liveCount = projects.filter((p) => p.deployment.status === "live").length;
  const branchCount = projects.reduce((total, p) => total + p.activeBranches.length, 0);
  const unfinishedCount = projects.reduce((total, p) => total + p.unfinishedFeatures.length, 0);

  return (
    <main className="min-h-screen bg-[#0b0d10] text-zinc-100">
      <section className="border-b border-white/10 bg-[#101419]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200">
                <Activity className="size-4" />
                Portfolio Project Intelligence Layer
              </div>
              <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                A self-updating operations dashboard for the work behind the portfolio.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Local Git history, active branches, deployment signals, screenshots, stack
                detection, case-study readiness, and proof points are collected by the backend on
                every request.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="https://www.arnavgokhale.com/projects/portfolio-intelligence-layer"
                  className="inline-flex items-center gap-2 border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-200 hover:bg-emerald-300/15"
                >
                  Read case study
                  <ExternalLink className="size-4" />
                </a>
                <a
                  href="https://github.com/arnavgokhale12/portfolio-intelligence-layer"
                  className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-300 hover:text-white"
                >
                  GitHub repo
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
              <Metric label="Projects" value={projects.length.toString()} icon={Layers3} />
              <Metric label="Live" value={liveCount.toString()} icon={Rocket} />
              <Metric label="Branches" value={branchCount.toString()} icon={GitBranch} />
              <Metric label="Open work" value={unfinishedCount.toString()} icon={ListChecks} />
            </div>
          </div>
        </div>
      </section>

      <ProjectList projects={projects} />
    </main>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="border border-white/10 bg-[#181e25] p-4">
      <div className="flex items-center justify-between text-zinc-400">
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        <Icon className="size-4" />
      </div>
      <div className="mt-3 font-mono text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}
```

---

## Task 6: Run dev server, verify, and commit

**Files:** none

- [ ] **Step 6.1: Start the dev server**

```bash
cd /Users/arnavgokhale/Projects/portfolio-intelligence-layer
npm run dev
```

Open http://localhost:3000 and verify:
- Header shows "Projects: 12" in the metrics row
- Both filter rows (Category + Health) appear above the card grid
- Each card shows a colored category badge
- GitHub links appear on all cards
- Stack chart appears in the sidebar below Portfolio Readiness
- "Last commit: ..." appears in the Status details panel
- Filtering by "Data" narrows to supply-chain-dashboard and euro-style-clusters
- Filtering by "Automation" narrows to ghrm, bluesky-autoposter, x-autoposter
- Empty state message appears when no projects match

- [ ] **Step 6.2: Commit**

```bash
cd /Users/arnavgokhale/Projects/portfolio-intelligence-layer
git add src/lib/project-intelligence.ts src/app/page.tsx src/app/components/project-list.tsx docs/
git commit -m "feat: add 9 projects to demo data; add filtering, category badges, GitHub links, stack chart"
```
