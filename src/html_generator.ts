import { Eta } from "@eta-dev/eta";
import { dirname, join, relative } from "@std/path";
import { serveDir, serveFile } from "@std/http/file-server";

export async function generateHtmlPlayer(m3u8File: string, outputFile = "player.html") {
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

  // Calculate relative path from output HTML to m3u8 file
  const m3u8Relative = join(
    "..",
    relative(dirname(outputFile), m3u8File),
  );

  const templatesDir = dirname(
    new URL("./templates/player.eta", import.meta.url).pathname,
  );
  const eta = new Eta({ views: templatesDir });

  const result = eta.render("./player", { videoSrc: m3u8Relative });

  await Deno.writeTextFile(outputFile, result);

  // Copy hls.min.js to the same directory as the output file
  const hlsSource = new URL("../static/hls.min.js", import.meta.url).pathname;
  const hlsDestination = join(dirname(outputFile), "hls.min.js");
  await Deno.copyFile(hlsSource, hlsDestination);

  return { outputFile, hlsDestination };
}

export async function startHtmlServer(outputFile: string, port = 8000) {
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
