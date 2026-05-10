# Portfolio Project Intelligence Layer

A self-updating operations dashboard for portfolio projects.

The app scans a workspace of local project folders and turns each project into a
portfolio operations record:

- latest Git commits
- active local branches
- unfinished features from TODO, roadmap, WIP, and review notes
- deployment signals from live URLs, the public portfolio projects page, or local Vercel links
- project screenshots from `public`, `screenshots`, `docs`, or `assets`
- detected stack from package dependencies and common project files
- case-study status from `case-study.md` or `project-showcase/<project>/README.md`
- proof points that explain what the project demonstrates

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

By default, the dashboard scans the parent folder of this app. Override that with:

```bash
PROJECTS_ROOT=/path/to/projects npm run dev
```

By default, live project links are enriched from `https://www.arnavgokhale.com/projects`.
Override that source with:

```bash
PORTFOLIO_PROJECTS_URL=https://example.com/projects npm run dev
```

## API

`GET /api/projects` returns the current project intelligence snapshot.

`GET /api/project-image?path=<absolute-image-path>` serves screenshot assets that
live under `PROJECTS_ROOT`.

## Notes

The scanner is server-only and runs dynamically. A production build may warn that
the app traces a broad filesystem root because it is designed to inspect sibling
project folders.
