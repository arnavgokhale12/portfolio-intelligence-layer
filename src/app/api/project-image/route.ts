import { getProjectsRoot } from "@/lib/project-intelligence";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedPath = searchParams.get("path");

  if (!requestedPath) {
    return new Response("Missing image path", { status: 400 });
  }

  const root = getProjectsRoot();
  const absolutePath = path.resolve(requestedPath);

  if (!absolutePath.startsWith(root + path.sep)) {
    return new Response("Image path is outside the project root", { status: 403 });
  }

  const extension = path.extname(absolutePath).toLowerCase();
  const contentType = MIME_TYPES[extension];

  if (!contentType) {
    return new Response("Unsupported image type", { status: 415 });
  }

  try {
    const image = await readFile(absolutePath);
    return new Response(image, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": contentType,
      },
    });
  } catch {
    return new Response("Image not found", { status: 404 });
  }
}
