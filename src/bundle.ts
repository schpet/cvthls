import * as esbuild from "npm:esbuild";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader";

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
