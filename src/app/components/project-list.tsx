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
  GitFork,
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
                  <GitFork className="size-4" />
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
                {project.proves.length > 0 ? (
                  project.proves.map((proof, i) => (
                    <li key={`${proof}-${i}`} className="text-sm leading-5 text-zinc-300">
                      {proof}
                    </li>
                  ))
                ) : (
                  <EmptyLine>No proof points captured.</EmptyLine>
                )}
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
                    alt={`${project.name} screenshot ${shot.fileName}`}
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
