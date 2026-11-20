# GTA 6 Cover Art Maker

[![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/makhlukmars53/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/makhlukmars53/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Turn a photo and a caption into multi-panel GTA-style poster art, offline in your browser. Load your own photos (or the two built-in samples), arrange them across 2-4 panels, crop and position each one by dragging, pick a Vice City sunset or neon colour grade, write the title and tagline, and export a PNG to share at 1080 x 1080, 1080 x 1350 or 1920 x 1080.

## What it does

- **Multi-panel layouts** — Hero + strip, Four squares, Three strips, Duo. One photo can be spread across every panel with a different crop per panel, or each panel can hold a different photo.
- **Per-panel crop and position** — click a panel to select it, drag it on the preview to move the photo, scroll to zoom, or use the zoom and pan sliders.
- **Caption editing** — title and subtitle in bold display lettering with an outline, an accent echo and an underline bar.
- **Colour grades** — Sunset, Neon Night, Vice Pink, Golden Hour. Each grade washes the photos, tints the lettering and draws a striped synthwave sun in the corner of the first panel.
- **Export** — one click writes a PNG at the chosen post size, rendered on canvas entirely on your machine.
- **Offline** — static files under `app/` only: no network request, no font or image download, no upload. Photos are read with FileReader and never leave the machine.

All art, lettering and gradients are drawn in code. No Rockstar Games logo, artwork or font is used anywhere.

## Run

Node 22 or newer is the only requirement, and only to serve the files:

```
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Any static file server works too; `app/index.html` is the page.

Deterministic screenshot scenes for headless checks: `?shot=cover` draws the cover alone and `?shot=editor` shows the editor with a photo loaded. The query picks the sample photo, caption, subtitle, layout, grade and size, for example:

```
http://localhost:8080/?shot=cover&photo=pier&caption=Sunset%20Heist&subtitle=Neon%20Nights&layout=hero&grade=sunset&size=1920x1080
```

`window.__shotReady` is set once the frame is painted. `shots.json` lists the four screenshots in `screenshots/`.

## Hand in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-app.ts`). Running it twice into two directories writes byte-identical output.

## License

MIT. See LICENSE.

<sub>Entered on [make.fun](https://make.fun/?ref=gxm3edtt&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
