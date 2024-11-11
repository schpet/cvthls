import ffmpeg, { FfprobeData } from "fluent-ffmpeg";

type Resolution = [width: number, height: number];
export async function getResolution(input: string): Promise<Resolution> {
  const { promise, resolve, reject } = Promise.withResolvers<Resolution>();
  ffmpeg.ffprobe(input, (err: Error | null, metadata: FfprobeData) => {
    if (err) {
      reject(err);
    } else {
      const video_stream = metadata.streams.find((
        stream: FfprobeData["streams"][0],
      ) => stream.codec_type === "video");
      if (video_stream == null) {
        reject(new Error("No video stream found"));
        return;
      }
      if (video_stream.width == null || video_stream.height == null) {
        reject(new Error("Invalid video stream: missing dimensions"));
        return;
      }
      resolve([video_stream.width, video_stream.height]);
    }
  });
  return promise;
}

export async function rcloneCopy(
  source: string,
  destination: string,
  overwrite = false,
): Promise<void> {
  const args = ["copy"];

  if (!overwrite) {
    args.push("--ignore-existing");
  }

  args.push(source, destination);

  const process = new Deno.Command("rclone", {
    args: args,
  });

  const { code, stdout, stderr } = await process.output();

  if (code !== 0) {
    const errorOutput = new TextDecoder().decode(stderr);
    throw new Error(`rclone copy failed: ${errorOutput}`);
  }

  console.log("rclone copy completed successfully");
}
