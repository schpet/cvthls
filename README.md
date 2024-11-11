# cvthls: convert video to hls

cli to convert video files into HLS chunks and a playlist. upload them to R2/S3/etc with rclone.

adapted from
[wesbos/R2-video-streaming](https://github.com/wesbos/R2-video-streaming)

> [!NOTE]
> project is very much WIP, mostly just an excuse to mess around with deno and
> jsr

## usage

```bash
# print help
deno run -A jsr:@schpet/cvthls

# convert video to hls
deno run -A jsr:@schpet/cvthls ./input/sample.mp4

# convert video to hls
deno run -A jsr:@schpet/cvthls ./input/sample.mp4

# convert video to hls and upload with rclone (https://rclone.org/) with a uuid
deno run -A jsr:@schpet/cvthls ./input/sample.mp4 --rclone-dest "r2files:streaming-video/cvthls" -u
```
