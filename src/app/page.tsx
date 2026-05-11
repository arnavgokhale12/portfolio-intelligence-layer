import {
  Activity,
  ExternalLink,
  GitBranch,
  Layers3,
  ListChecks,
  Rocket,
  type LucideIcon,
} from "lucide-react";
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
