import * as esbuild from "https://deno.land/x/esbuild@v0.19.8/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.2/mod.ts";

export async function bundleJs(outputDir: string) {
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
