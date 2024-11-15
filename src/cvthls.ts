import { Command } from "@cliffy/command";

const PLAYLIST_FILENAME = "playlist.m3u8";
const PLAYER_FILENAME = "player.html";
import { join } from "@std/path";
import { ensureDir } from "@std/fs";
import {
  PRESET_CONFIGS,
  type PresetConfig,
  process_presets,
} from "./transcode.ts";
import { rcloneCopy } from "./utils.ts";
import { generateHtmlPlayer, startHtmlServer } from "./html.ts";
import { generate } from "@std/uuid/unstable-v7";

const command = new Command()
  .name("cvthls")
  .version("0.1.0")
  .description("Converts video to stream")
  .arguments("<input-video:string> [destination:string]")
  .option(
    "-r, --rclone-dest <path:string>",
    "rclone destination path (e.g. 'remote:path/to/dest')",
  )
  .option(
    "-w, --rclone-overwrite",
    "overwrite existing files in rclone destination",
  )
  .option(
    "-u, --rclone-dest-uuid",
    "append a UUID to the rclone destination path",
  )
  .option(
    "-p, --preset <preset:string>",
    "preset configuration to use (standard or fast)",
    {
      default: "standard" as PresetConfig,
      value: (preset: string): PresetConfig => {
        if (preset in PRESET_CONFIGS) {
          return preset as PresetConfig;
        }
        throw new Error(
          `Invalid preset: ${preset}. Available presets: ${
            Object.keys(PRESET_CONFIGS).join(", ")
          }`,
        );
      },
    },
  )
  .action(async (options, inputVideo, destination?) => {
    // If no destination provided, create a temp directory
    if (!destination) {
      destination = await Deno.makeTempDir({ prefix: "cvthls_" });
      console.log(
        "No destination provided, using temp directory:",
        destination,
      );
    }

    // Ensure the destination directory exists
    await ensureDir(destination);
    console.log("Converting video to stream:");
    console.log("Input video:", inputVideo);
    console.log("Destination:", destination);

    try {
      // Check if input file exists
      try {
        const stat = await Deno.stat(inputVideo);
        if (!stat.isFile) {
          throw new Error("Input path exists but is not a file");
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          throw new Error(`Input file not found: ${inputVideo}`);
        }
        throw error;
      }

      const inputUrl = new URL(inputVideo, `file://${Deno.cwd()}/`);
      const inputFilename = inputUrl.pathname.split("/").pop()?.split(".")[0];
      if (!inputFilename) {
        throw new Error("Could not determine input filename");
      }
      const playlistPath = join(destination, inputFilename, PLAYLIST_FILENAME);
      await process_presets(inputUrl, destination, options.preset, playlistPath);

      // If rclone destination is provided, copy the output
      if (options.rcloneDest) {
        let rcloneDest = options.rcloneDest;
        if (options.rcloneDestUuid) {
          const id = generate();
          rcloneDest = join(rcloneDest, id);
        }
        console.log("Copying output to rclone destination:", rcloneDest);
        try {
          await rcloneCopy(destination, rcloneDest, options.rcloneOverwrite);
          console.log(`\nCopied output:\n\n${rcloneDest}`);
          // Get the input filename without extension to construct playlist.m3u8 path
          const inputFilename = new URL(inputVideo, `file://${Deno.cwd()}/`)
            .pathname.split("/").pop()?.split(".")[0];
          if (inputFilename) {
            const playlistPath = join(
              rcloneDest,
              inputFilename,
              PLAYLIST_FILENAME,
            );
            console.log(playlistPath);
          }
        } catch (error) {
          console.error("Error copying to rclone destination:", error);
          // Don't exit here - the transcoding was successful
        }
      }

      // Generate HTML player
      if (inputFilename) {
        const playlistM3u8Path = join(
          destination,
          inputFilename,
          PLAYLIST_FILENAME,
        );
        const htmlOutputPath = join(
          destination,
          inputFilename,
          PLAYER_FILENAME,
        );

        try {
          const { outputFile, hlsDestination } = await generateHtmlPlayer(
            playlistM3u8Path,
            htmlOutputPath,
          );
          console.log(`Generated HTML player at: ${outputFile}`);
          console.log(`Copied hls.min.js to: ${hlsDestination}`);
          startHtmlServer(outputFile);
        } catch (error) {
          console.error("Error generating HTML player:", error);
          // Don't exit here - the transcoding was successful
        }
      }
    } catch (error) {
      console.error("Error processing video:", error);
      Deno.exit(1);
    }
  })
  .command(
    "html",
    new Command()
      .description(
        "Generate an HTML page with HLS video player from local m3u8 file",
      )
      .arguments("<m3u8-file:string> [output-file:string]")
      .action(async (_, m3u8File, outputFile = PLAYER_FILENAME) => {
        try {
          const { outputFile: htmlFile } = await generateHtmlPlayer(
            m3u8File,
            outputFile,
          );
          startHtmlServer(htmlFile);
        } catch (error) {
          console.error("Error generating HTML:", error);
          Deno.exit(1);
        }
      }),
  );

await command.parse(Deno.args);
