import {
  Activity,
  BadgeCheck,
  Camera,
  CircleDot,
  Clock3,
  Code2,
  ExternalLink,
  GitBranch,
  GitCommitHorizontal,
  Layers3,
  ListChecks,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { getProjectSignals, type ProjectSignal } from "@/lib/project-intelligence";

export const dynamic = "force-dynamic";

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

export default async function Home() {
  const projects = await getProjectSignals();
  const liveCount = projects.filter((project) => project.deployment.status === "live").length;
  const caseStudyCount = projects.filter((project) => project.caseStudyStatus === "ready").length;
  const branchCount = projects.reduce(
    (total, project) => total + project.activeBranches.length,
    0,
  );
  const unfinishedCount = projects.reduce(
    (total, project) => total + project.unfinishedFeatures.length,
    0,
  );

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
                A self-updating operations dashboard for the work behind the
                portfolio.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Local Git history, active branches, deployment signals,
                screenshots, stack detection, case-study readiness, and proof
                points are collected by the backend on every request.
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

      <section className="mx-auto grid w-full max-w-7xl gap-5 px-5 py-6 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-10">
        <aside className="h-fit border border-white/10 bg-[#12171d] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <CircleDot className="size-4 text-emerald-300" />
            Portfolio Readiness
          </div>
          <div className="mt-4 space-y-4">
            <ProgressRow label="Case studies" value={caseStudyCount} total={projects.length} />
            <ProgressRow label="Live deployments" value={liveCount} total={projects.length} />
            <ProgressRow
              label="Documented next work"
              value={projects.filter((project) => project.unfinishedFeatures.length > 0).length}
              total={projects.length}
            />
          </div>
          <div className="mt-5 border-t border-white/10 pt-4 text-sm leading-6 text-zinc-400">
            Data comes from sibling folders under{" "}
            <code className="font-mono text-zinc-200">PROJECTS_ROOT</code>. Set
            that env var to point this dashboard at a different portfolio
            workspace.
          </div>
        </aside>

        <div className="grid gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.path} project={project} />
          ))}
        </div>
      </section>
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

function ProjectCard({ project }: { project: ProjectSignal }) {
  const currentBranch = project.activeBranches.find((branch) => branch.isCurrent);

  return (
    <article className="border border-white/10 bg-[#12171d]">
      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <HealthBadge health={project.health} />
            <Badge icon={BadgeCheck}>
              Case study: {caseStudyLabels[project.caseStudyStatus]}
            </Badge>
            <Badge icon={Rocket}>{deploymentLabel(project)}</Badge>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{project.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                {project.description}
              </p>
            </div>
            {project.deployment.url ? (
              <a
                href={project.deployment.url}
                className="inline-flex shrink-0 items-center gap-2 border border-white/10 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-300 hover:text-emerald-200"
                target="_blank"
                rel="noreferrer"
              >
                Open live
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Panel title="Latest GitHub commits" icon={GitCommitHorizontal}>
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
                  project.activeBranches.map((branch, index) => (
                    <span
                      key={`${branch.name}-${index}`}
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
                  Current branch:{" "}
                  <code className="font-mono text-zinc-300">{currentBranch.name}</code>
                </div>
              ) : null}
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel title="Unfinished features" icon={ListChecks}>
              <ul className="space-y-2">
                {project.unfinishedFeatures.length > 0 ? (
                  project.unfinishedFeatures.map((feature, index) => (
                    <li key={`${feature}-${index}`} className="text-sm leading-5 text-zinc-300">
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
                {project.proves.map((proof, index) => (
                  <li key={`${proof}-${index}`} className="text-sm leading-5 text-zinc-300">
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
              Project screenshots
            </div>
            {project.screenshots.length > 0 ? (
              <div className="grid gap-2">
                {project.screenshots.slice(0, 2).map((screenshot) => (
                  <Image
                    key={screenshot.absolutePath}
                    src={screenshot.url}
                    alt={`${project.name} screenshot ${screenshot.fileName}`}
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
                project.stack.map((item, index) => (
                  <span key={`${item}-${index}`} className="bg-white/7 px-2 py-1 text-xs text-zinc-300">
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
            <p className="mt-3 font-mono text-xs text-zinc-500">{project.relativePath}</p>
          </div>
        </div>
      </div>
    </article>
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
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium ${tone}`}>
      <Activity className="size-3.5" />
      {healthLabels[health]}
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
