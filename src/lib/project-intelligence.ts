import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PROJECT_ROOT = process.env.PROJECTS_ROOT
  ? path.resolve(process.env.PROJECTS_ROOT)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "..");

const SHOULD_USE_DEMO_DATA = Boolean(process.env.VERCEL) && !process.env.PROJECTS_ROOT;

const PORTFOLIO_PROJECTS_URL =
  process.env.PORTFOLIO_PROJECTS_URL ?? "https://www.arnavgokhale.com/projects";

const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  ".vercel",
  "node_modules",
  "vendor",
  "dist",
  "build",
  "coverage",
  ".expo",
  ".turbo",
]);

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
]);

const STACK_LABELS: Record<string, string> = {
  next: "Next.js",
  react: "React",
  "react-native": "React Native",
  expo: "Expo",
  typescript: "TypeScript",
  tailwindcss: "Tailwind CSS",
  "lucide-react": "Lucide",
  "@vercel/analytics": "Vercel Analytics",
  "ai": "Vercel AI SDK",
  "@ai-sdk/react": "Vercel AI SDK",
  "@clerk/nextjs": "Clerk",
  vite: "Vite",
  python: "Python",
};

const DEPLOYMENT_ALIASES: Record<string, string[]> = {
  BAYC: ["bayc", "bored-ape", "gallery"],
  ghrm: ["ghrm"],
  "supply-chain-dashboard": ["supply-chain-dashboard"],
  "self-rpg": ["self-rpg", "selfrpg"],
  "vocab-phone": ["lexistack", "vocab-phone"],
  cortex: ["cortex"],
  "euro-style-clusters": ["euro-style-clusters"],
};

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

export type CommitSignal = {
  hash: string;
  subject: string;
  author: string;
  date: string;
};

export type BranchSignal = {
  name: string;
  isCurrent: boolean;
};

export type DeploymentSignal = {
  status: "live" | "configured" | "unknown";
  url: string | null;
  provider: "vercel" | "static" | "unknown";
  note: string;
};

export type ScreenshotSignal = {
  fileName: string;
  absolutePath: string;
  url: string;
};

export async function getProjectSignals(): Promise<ProjectSignal[]> {
  if (SHOULD_USE_DEMO_DATA) return DEMO_PROJECTS;

  const entries = await readdir(PROJECT_ROOT, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => path.join(PROJECT_ROOT, entry.name));

  const portfolioDeployments = await readPortfolioDeployments();
  const projects = await Promise.all(
    candidates.map((candidate) => readProjectSignal(candidate, portfolioDeployments)),
  );

  return projects
    .filter((project): project is ProjectSignal => project !== null)
    .sort((a, b) => {
      const aTime = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bTime = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return bTime - aTime;
    });
}

const DEMO_PROJECTS: ProjectSignal[] = [
  {
    name: "portfolio-intelligence-layer",
    path: "/demo/portfolio-intelligence-layer",
    relativePath: "portfolio-intelligence-layer",
    description:
      "Self-updating operations dashboard that tracks project metadata, Git activity, deployment state, screenshots, stack signals, and case-study readiness.",
    latestCommits: [
      {
        hash: "f7ed344",
        subject: "Add project links",
        author: "Arnav Gokhale",
        date: "2026-05-10T22:56:31.000Z",
      },
      {
        hash: "0ac7826",
        subject: "Build portfolio intelligence dashboard",
        author: "Arnav Gokhale",
        date: "2026-05-10T22:52:00.000Z",
      },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: [
      "Add authenticated Vercel deployment status lookup",
      "Add screenshot refresh jobs for projects with public demos",
      "Export project proof points back into the public portfolio",
    ],
    deployment: {
      status: "live",
      url: "https://portfolio-intelligence-layer.vercel.app",
      provider: "vercel",
      note: "Live product page deployed on Vercel with public demo data.",
    },
    screenshots: [],
    stack: ["Next.js", "TypeScript", "Git", "Vercel", "Tailwind CSS", "Lucide"],
    caseStudyStatus: "ready",
    proves: [
      "Can build backend scanners around real developer workflows.",
      "Can turn project metadata into portfolio operations intelligence.",
      "Can ship internal tooling as a usable product surface.",
      "Can connect GitHub, Vercel, screenshots, and case-study readiness.",
    ],
    health: "active",
    updatedAt: "2026-05-10T22:56:31.000Z",
    category: "Web",
    githubUrl: "https://github.com/arnavgokhale12/portfolio-intelligence-layer",
  },
  {
    name: "cortex",
    path: "/demo/cortex",
    relativePath: "cortex",
    description:
      "Multi-agent AI workspace with streaming responses, specialized agents, and a visual task network.",
    latestCommits: [
      {
        hash: "public",
        subject: "Public portfolio signal",
        author: "Arnav Gokhale",
        date: "2025-04-11T00:00:00.000Z",
      },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: ["Refresh authenticated product screenshot for portfolio card"],
    deployment: {
      status: "live",
      url: "https://cortex-arnavgokhale12s-projects.vercel.app",
      provider: "vercel",
      note: "Live URL found on the public portfolio.",
    },
    screenshots: [],
    stack: ["Next.js", "Vercel AI SDK", "TypeScript", "Framer Motion", "Zustand"],
    caseStudyStatus: "ready",
    proves: [
      "Can build AI-native interfaces beyond chat.",
      "Can coordinate multi-agent product workflows.",
      "Can ship polished full-stack AI prototypes.",
    ],
    health: "active",
    updatedAt: "2025-04-11T00:00:00.000Z",
    category: "AI",
    githubUrl: "https://github.com/arnavgokhale12/cortex",
  },
  {
    name: "lexistack",
    path: "/demo/lexistack",
    relativePath: "lexistack",
    description:
      "Vocabulary learning app with spaced repetition, mobile-first flows, and daily review mechanics.",
    latestCommits: [
      {
        hash: "public",
        subject: "Public portfolio signal",
        author: "Arnav Gokhale",
        date: "2024-03-15T00:00:00.000Z",
      },
    ],
    activeBranches: [{ name: "main", isCurrent: true }],
    unfinishedFeatures: ["Add fresh mobile screenshots to public project card"],
    deployment: {
      status: "live",
      url: "https://lexistack.vercel.app",
      provider: "vercel",
      note: "Live URL found on the public portfolio.",
    },
    screenshots: [],
    stack: ["React Native", "Expo", "TypeScript", "Spaced Repetition"],
    caseStudyStatus: "ready",
    proves: [
      "Can design and ship learning-product UX.",
      "Can connect mobile app mechanics to retention loops.",
      "Can document product value through case studies.",
    ],
    health: "active",
    updatedAt: "2024-03-15T00:00:00.000Z",
    category: "Mobile",
    githubUrl: "https://github.com/arnavgokhale12/vocab-phone",
  },
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
];

export function getProjectsRoot() {
  return PROJECT_ROOT;
}

async function readProjectSignal(
  projectPath: string,
  portfolioDeployments: PortfolioDeploymentSignal[],
): Promise<ProjectSignal | null> {
  const name = path.basename(projectPath);
  const hasGit = existsSync(path.join(projectPath, ".git"));
  const hasPackage = existsSync(path.join(projectPath, "package.json"));
  const hasReadme = existsSync(path.join(projectPath, "README.md"));

  if (!hasGit && !hasPackage && !hasReadme) {
    return null;
  }

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

  const deployment = await detectDeployment(name, projectPath, portfolioDeployments);
  const caseStudyStatus = await detectCaseStudy(name, projectPath);
  const proves = inferProofPoints({ name, stack, unfinished, deployment });
  const updatedAt = commits[0]?.date ?? null;

  return {
    name,
    path: projectPath,
    relativePath: path.relative(PROJECT_ROOT, projectPath),
    description,
    latestCommits: commits,
    activeBranches: branches,
    unfinishedFeatures: unfinished,
    deployment,
    screenshots,
    stack,
    caseStudyStatus,
    proves,
    health: getHealth({ hasGit, commits, caseStudyStatus, unfinished }),
    updatedAt,
    category: inferCategory(stack),
    githubUrl,
  };
}

async function git(projectPath: string, args: string[]) {
  try {
    const { stdout } = await execFileAsync("git", args, {
      cwd: projectPath,
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });
    return stdout.trim();
  } catch {
    return "";
  }
}

async function inferGithubUrl(projectPath: string): Promise<string | null> {
  const remote = await git(projectPath, ["remote", "get-url", "origin"]);
  if (!remote || !remote.includes("github.com")) return null;
  const normalized = remote.startsWith("git@")
    ? remote.replace(/^git@github\.com:/, "https://github.com/")
    : remote;
  return normalized.replace(/\.git$/, "").trim();
}

function inferCategory(stack: string[]): ProjectSignal["category"] {
  const s = stack.map((t) => t.toLowerCase());
  if (s.some((t) => ["vercel ai sdk", "ai sdk", "@ai-sdk", "openai", "anthropic", "langchain"].some((kw) => t.includes(kw)))) return "AI";
  if (s.some((t) => ["react native", "expo", "ios", "android"].some((kw) => t.includes(kw)))) return "Mobile";
  if (s.some((t) => ["streamlit", "pandas", "numpy", "scikit-learn", "matplotlib", "plotly"].some((kw) => t.includes(kw)))) return "Data";
  if (s.some((t) => ["playwright", "github actions", "automation", "cron", "bot", "scheduler"].some((kw) => t.includes(kw)))) return "Automation";
  if (s.some((t) => ["mcp", "model context protocol"].some((kw) => t.includes(kw)))) return "Tools";
  return "Web";
}

async function readLatestCommits(projectPath: string): Promise<CommitSignal[]> {
  const output = await git(projectPath, [
    "log",
    "-5",
    "--date=iso-strict",
    "--pretty=format:%h%x1f%ad%x1f%an%x1f%s",
  ]);

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, author, subject] = line.split("\u001f");
      return { hash, date, author, subject };
    });
}

async function readBranches(projectPath: string): Promise<BranchSignal[]> {
  const output = await git(projectPath, [
    "branch",
    "--format=%(HEAD)|%(refname:short)",
  ]);

  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [head, name] = line.split("|");
      return { name, isCurrent: head === "*" };
    })
    .slice(0, 8);
}

async function readDescription(projectPath: string) {
  const packagePath = path.join(projectPath, "package.json");
  if (existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
        description?: string;
      };
      if (packageJson.description) return packageJson.description;
    } catch {
      // Fall through to README extraction.
    }
  }

  const readme = await readTextIfExists(path.join(projectPath, "README.md"));
  const firstParagraph = readme
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("```"))[0];

  return firstParagraph ?? "No description found yet.";
}

async function detectStack(projectPath: string) {
  const labels = new Set<string>();
  const packagePath = path.join(projectPath, "package.json");

  if (existsSync(packagePath)) {
    try {
      const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      for (const dep of Object.keys(deps)) {
        labels.add(STACK_LABELS[dep] ?? dep);
      }
    } catch {
      labels.add("JavaScript");
    }
  }

  const files: string[] = await readdir(projectPath).catch(() => []);
  if (files.some((file) => file.endsWith(".py"))) labels.add("Python");
  if (files.includes("Gemfile")) labels.add("Ruby");
  if (files.includes("Podfile")) labels.add("iOS");
  if (files.includes("app.json") || files.includes("app.config.js")) labels.add("Expo");
  if (files.includes("next.config.ts") || files.includes("next.config.js")) {
    labels.add("Next.js");
  }

  return [...labels].slice(0, 8);
}

async function findUnfinishedFeatures(projectPath: string) {
  const files = await collectTextFiles(projectPath, 80);
  const hits: string[] = [];
  const matcher = /\b(todo|fixme|wip|unfinished|roadmap|next up|needs review)\b/i;

  for (const file of files) {
    const text = await readTextIfExists(file);
    for (const line of text.split("\n")) {
      const cleaned = line.replace(/^[-*#/ ]+/, "").trim();
      if (matcher.test(cleaned) && cleaned.length > 4) {
        hits.push(`${path.basename(file)}: ${cleaned.slice(0, 140)}`);
      }
      if (hits.length >= 5) return hits;
    }
  }

  return hits;
}

async function findScreenshots(projectPath: string): Promise<ScreenshotSignal[]> {
  const likelyDirs = ["public", "screenshots", "docs", "assets"];
  const screenshots: ScreenshotSignal[] = [];

  for (const dir of likelyDirs) {
    const absolute = path.join(projectPath, dir);
    if (!existsSync(absolute)) continue;

    const imagePaths = await collectImages(absolute, 8);
    for (const imagePath of imagePaths) {
      screenshots.push({
        fileName: path.basename(imagePath),
        absolutePath: imagePath,
        url: `/api/project-image?path=${encodeURIComponent(imagePath)}`,
      });
      if (screenshots.length >= 4) return screenshots;
    }
  }

  return screenshots;
}

async function detectDeployment(
  projectName: string,
  projectPath: string,
  portfolioDeployments: PortfolioDeploymentSignal[],
): Promise<DeploymentSignal> {
  const readme = await readTextIfExists(path.join(projectPath, "README.md"));
  const url = readme.match(/https:\/\/[^\s)]+(?:vercel\.app|netlify\.app|pages\.dev|streamlit\.app)[^\s)]*/i)?.[0] ?? null;

  if (url) {
    return {
      status: "live",
      url,
      provider: getDeploymentProvider(url),
      note: "Live URL found in project docs.",
    };
  }

  const portfolioDeployment = matchPortfolioDeployment(projectName, portfolioDeployments);
  if (portfolioDeployment) {
    return {
      status: "live",
      url: portfolioDeployment.url,
      provider: getDeploymentProvider(portfolioDeployment.url),
      note: `Live URL found on ${PORTFOLIO_PROJECTS_URL}.`,
    };
  }

  if (existsSync(path.join(projectPath, ".vercel", "project.json"))) {
    return {
      status: "configured",
      url: null,
      provider: "vercel",
      note: "Linked to Vercel locally; add VERCEL_TOKEN to resolve live deployment status.",
    };
  }

  return {
    status: "unknown",
    url: null,
    provider: "unknown",
    note: "No deployment signal found yet.",
  };
}

type PortfolioDeploymentSignal = {
  url: string;
  normalizedUrl: string;
};

async function readPortfolioDeployments(): Promise<PortfolioDeploymentSignal[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const response = await fetch(PORTFOLIO_PROJECTS_URL, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return [];

    const html = await response.text();
    const urls = [
      ...html.matchAll(/https:\/\/[^"'<>\s)]+(?:vercel\.app|netlify\.app|pages\.dev|streamlit\.app)[^"'<>\s)]*/gi),
    ].map((match) => decodeHtml(match[0]));

    return [...new Set(urls)].map((url) => ({
      url,
      normalizedUrl: normalizeForMatch(url),
    }));
  } catch {
    return [];
  }
}

function matchPortfolioDeployment(
  projectName: string,
  deployments: PortfolioDeploymentSignal[],
) {
  const aliases = DEPLOYMENT_ALIASES[projectName] ?? [
    projectName,
    projectName.replace(/-/g, ""),
  ];

  return deployments.find((deployment) =>
    aliases.some((alias) => deployment.normalizedUrl.includes(normalizeForMatch(alias))),
  );
}

function getDeploymentProvider(url: string): DeploymentSignal["provider"] {
  return url.includes("vercel.app") ? "vercel" : "static";
}

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#x2F;", "/")
    .replaceAll("&#47;", "/");
}

async function detectCaseStudy(
  projectName: string,
  projectPath: string,
): Promise<ProjectSignal["caseStudyStatus"]> {
  const showcaseReadme = path.join(PROJECT_ROOT, "project-showcase", projectName, "README.md");
  const localCaseStudy = path.join(projectPath, "case-study.md");
  const readme = await readTextIfExists(path.join(projectPath, "README.md"));

  if (existsSync(showcaseReadme) || existsSync(localCaseStudy)) return "ready";
  if (/case study|case-study/i.test(readme)) return "draft";
  return "missing";
}

function inferProofPoints(input: {
  name: string;
  stack: string[];
  unfinished: string[];
  deployment: DeploymentSignal;
}) {
  const stack = new Set(input.stack);
  const points = new Set<string>();

  if (stack.has("Next.js")) points.add("Can ship production-grade web apps with server-rendered data.");
  if (stack.has("React Native") || stack.has("Expo")) points.add("Can build mobile-first product experiences.");
  if (stack.has("Vercel AI SDK")) points.add("Can integrate modern AI workflows into real products.");
  if (stack.has("Python")) points.add("Can turn analysis and data pipelines into portfolio artifacts.");
  if (input.deployment.status !== "unknown") points.add("Can deploy and operate software beyond localhost.");
  if (input.unfinished.length > 0) points.add("Makes product scope and next work visible instead of hiding it.");

  points.add(`Shows ownership of ${input.name.replace(/[-_]/g, " ")} from code to narrative.`);

  return [...points].slice(0, 4);
}

function getHealth(input: {
  hasGit: boolean;
  commits: CommitSignal[];
  caseStudyStatus: ProjectSignal["caseStudyStatus"];
  unfinished: string[];
}): ProjectSignal["health"] {
  if (!input.hasGit) return "needs-git";
  if (input.caseStudyStatus === "missing") return "needs-case-study";
  const lastCommit = input.commits[0]?.date ? Date.parse(input.commits[0].date) : 0;
  const daysSinceCommit = (Date.now() - lastCommit) / 86_400_000;
  if (daysSinceCommit > 45 && input.unfinished.length > 0) return "quiet";
  return "active";
}

async function collectTextFiles(root: string, limit: number) {
  const output: string[] = [];
  const allowed = new Set([".md", ".mdx", ".ts", ".tsx", ".js", ".jsx", ".json", ".py"]);

  async function walk(current: string) {
    if (output.length >= limit) return;
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (output.length >= limit) return;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) await walk(fullPath);
        continue;
      }
      if (allowed.has(path.extname(entry.name).toLowerCase())) output.push(fullPath);
    }
  }

  await walk(root);
  return output;
}

async function collectImages(root: string, limit: number) {
  const output: string[] = [];

  async function walk(current: string) {
    if (output.length >= limit) return;
    const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (output.length >= limit) return;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) await walk(fullPath);
        continue;
      }
      if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) output.push(fullPath);
    }
  }

  await walk(root);
  return output;
}

async function readTextIfExists(filePath: string) {
  try {
    const fileStat = await stat(filePath);
    if (fileStat.size > 300_000) return "";
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}
