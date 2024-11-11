entry := "src/cvthls.ts"

default:
    just run ./input/sample.mp4 ./output  --preset fast

run *ARGS:
    deno run --allow-env --allow-read --allow-write --allow-sys --allow-run {{entry}} {{ARGS}}

compile:
    deno compile --allow-env --allow-read --allow-write --allow-sys --allow-run {{entry}}

publish:
    deno publish

check:
    deno check cvthls.ts

test-rclone:
    just run ./input/sample.mp4 --rclone-dest "r2files:streaming-video/cvthls" --rclone-overwrite

test-rclone-u:
    just run ./input/sample.mp4 --preset fast --rclone-dest "r2files:streaming-video/cvthls" -u

test-input-only:
    just run ./input/sample.mp4
