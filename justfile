entry := "src/cvthls.ts"

sample preset = "fast":
    rm -rf output/sample
    just run ./input/sample.mp4 ./output/sample --preset {{preset}}
    just run serve output/sample/player.html

sample-standard:
    just sample standard

run *ARGS:
    deno run --allow-net --allow-env --allow-read --allow-write --allow-sys --allow-run {{entry}} {{ARGS}}

compile:
    deno compile --allow-env --allow-read --allow-write --allow-sys --allow-run {{entry}}

publish:
    deno publish

check:
    deno check cvthls.ts

test-rclone:
    just run ./input/sample.mp4 --rclone-dest "r2files:streaming-video/cvthls/test" --rclone-overwrite

test-rclone-u:
    just run ./input/sample.mp4 --preset fast --rclone-dest "r2files:streaming-video/cvthls/test" -u

test-input-only:
    just run ./input/sample.mp4
