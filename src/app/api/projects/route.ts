import { getProjectSignals } from "@/lib/project-intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await getProjectSignals();
  return Response.json({
    generatedAt: new Date().toISOString(),
    projects,
  });
}
