# Portfolio Intelligence Layer — Enhancement Design
Date: 2026-05-11

## Goal
Add all public-facing projects to the dashboard's demo data, and enhance the UI with filtering, category labels, GitHub links, last-commit display, and a stack breakdown chart.

## Section 1 — Data Layer

### Type changes (`src/lib/project-intelligence.ts`)
Add two optional fields to `ProjectSignal`:
- `category: "Web" | "AI" | "Mobile" | "Data" | "Automation" | "Tools"`
- `githubUrl: string | null`

### DEMO_PROJECTS expansion
Grow from 3 → 12 entries. New projects (all using real commit hashes from git):
| Project | Category | GitHub URL |
|---|---|---|
| supply-chain-dashboard | Data | https://github.com/arnavgokhale12/supply-chain-dashboard |
| BAYC | Web | https://github.com/arnavgokhale12/BAYC |
| euro-style-clusters | Data | https://github.com/arnavgokhale12/euro-style-clusters |
| ghrm | Automation | https://github.com/arnavgokhale12/ghrm |
| self-rpg | Web | https://github.com/arnavgokhale12/self-rpg |
| x-autoposter | Automation | https://github.com/arnavgokhale12/x-autoposter |
| groupme-mcp | Tools | https://github.com/arnavgokhale12/groupme-mcp |
| bluesky-autoposter | Automation | https://github.com/arnavgokhale12/bluesky-autoposter |
| automation-frontier | Web | https://github.com/arnavgokhale12/automation-frontier |

Existing entries (portfolio-intelligence-layer, cortex, lexistack) get `category` and `githubUrl` added.

### Live mode inference
- `githubUrl`: `git remote get-url origin`, strip `.git` suffix, null if no remote
- `category`: inferred from stack keywords (React Native/Expo → Mobile; AI SDK/agent → AI; Python + data libs → Data; GitHub Actions/cron automation → Automation; MCP → Tools; default → Web)

## Section 2 — Filter Bar (Client Component)

New file: `src/app/components/project-list.tsx` — `"use client"` component.

Receives the full `projects: ProjectSignal[]` array from the server page. Holds two pieces of filter state: `activeCategory` and `activeHealth`. Filters are AND'd. Shows "Showing N of 12" count.

Two pill rows above the card grid:
1. Category: All · Web · AI · Mobile · Data · Automation · Tools
2. Health: All · Active · Needs case study · Quiet · Needs Git

Stack chart is informational only; no click interaction (stack names don't map cleanly to category names).

## Section 3 — Card Enhancements

- **Category badge**: colored pill alongside health/case-study/deployment badges. Colors: Web→blue, AI→purple, Mobile→teal, Data→orange, Automation→yellow, Tools→slate.
- **GitHub link**: ghost button with GitHub icon, placed next to (or below) "Open live". Links to `githubUrl`. Hidden if null.
- **Last commit**: displayed in the Status details panel as "Last commit: May 10 2026" using the existing `updatedAt` field.

## Section 4 — Stack Chart in Sidebar

Added below the "Portfolio Readiness" block in the `<aside>`.

Counts how many of the 12 projects use each technology. Top 8 stacks sorted by count. Rendered as labeled CSS bars (no chart library). Informational only — no click interaction.

## Architecture

```
page.tsx (server component)
  ├── fetches projects: ProjectSignal[]
  ├── renders header + metrics (unchanged)
  └── renders <ProjectList projects={projects} /> (client component)
        ├── holds filter state (category, health)
        ├── renders filter pills
        ├── renders sidebar (ProgressRows + StackChart)
        └── renders filtered project cards
```

The sidebar moves inside `ProjectList` so the stack chart can share filter state with the pills. The server component stays minimal.

## Error Handling
- `githubUrl` is nullable; GitHub button simply hidden when null.
- Category defaults to "Web" if inference fails.
- Stack chart gracefully handles 0-count entries (skips them).

## Testing
- Verify all 12 demo projects render without errors on `npm run dev`.
- Verify filters narrow the list correctly (AND logic).
- Verify clicking a stack bar updates the category filter.
- Verify GitHub links open correct repos.
- Verify live-mode scan still works (no type errors from new fields).
