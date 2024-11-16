import { Eta } from "@eta-dev/eta";
import { dirname, relative } from "@std/path";
import { serveDir, serveFile } from "@std/http/file-server";
import { bundleJs } from "./bundle.ts";

export async function generateHtmlPlayer(
  m3u8File: string,
  outputFile = "player.html",
) {
  // Verify m3u8 file exists
  try {
    const stat = await Deno.stat(m3u8File);
    if (!stat.isFile) {
      throw new Error("M3U8 path exists but is not a file");
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`M3U8 file not found: ${m3u8File}`);
    }
    throw error;
  }

  const m3u8Relative = relative(dirname(outputFile), m3u8File);

  const templatesDir = dirname(
    new URL("./templates/player.eta", import.meta.url).pathname,
  );
  const eta = new Eta({ views: templatesDir });

  const result = eta.render("./player", { videoSrc: m3u8Relative });

  // Bundle JavaScript
  const outputDir = dirname(outputFile);
  await bundleJs(outputDir);

  await Deno.writeTextFile(outputFile, result);

  return { outputFile };
}

export function startHtmlServer(outputFile: string, port = 8000) {
  console.log(`Starting HTTP server at http://localhost:${port}`);

  Deno.serve({
    port,
    handler: (req) => {
      const pathname = new URL(req.url).pathname;
      if (pathname === "/") {
        return serveFile(req, outputFile);
      }

      return serveDir(req, {
        fsRoot: dirname(outputFile),
      });
    },
  });
}
