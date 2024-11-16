import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";
import { ensureDir } from "@std/fs";

export async function bundleJs(outputDir: string) {
  // Ensure the output directory exists
  await ensureDir(outputDir);
  const result = await esbuild.build({
    plugins: [...denoPlugins()],
    entryPoints: [{
      in: new URL("./client/index.ts", import.meta.url).pathname,
      out: "player-bundle",
    }],
    bundle: true,
    outdir: outputDir,
    format: "esm",
    platform: "browser",
    target: "es2020",
  });

  return result;
}
