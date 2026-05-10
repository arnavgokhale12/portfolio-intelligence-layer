import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const PROJECT_ROOT = process.env.PROJECTS_ROOT
  ? path.resolve(process.env.PROJECTS_ROOT)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "..");

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

  const [commits, branches, description, stack, unfinished, screenshots] =
    await Promise.all([
      hasGit ? readLatestCommits(projectPath) : Promise.resolve([]),
      hasGit ? readBranches(projectPath) : Promise.resolve([]),
      readDescription(projectPath),
      detectStack(projectPath),
      findUnfinishedFeatures(projectPath),
      findScreenshots(projectPath),
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
