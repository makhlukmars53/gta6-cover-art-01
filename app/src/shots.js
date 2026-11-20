// Deterministic scenes for screenshots: ?shot=cover draws the cover alone at
// full size, ?shot=editor shows the editor with a photo loaded. The query
// picks the sample photo, the caption, the layout, the grade and the size, so
// a headless browser can reproduce the exact same frame every time.
// window.__shotReady is set once the frame is painted.

/** Applies a shot scene through `apply(config)` and marks the page ready. */
export async function runShot(shot, query, apply) {
  if (shot === 'cover') document.body.classList.add('shot-cover');
  const config = {
    photo: query.get('photo') ?? 'pier',
    title: query.get('caption') ?? 'Sunset Heist',
    subtitle: query.get('subtitle') ?? 'Neon Nights',
    layout: query.get('layout') ?? 'hero',
    grade: query.get('grade') ?? 'sunset',
    size: query.get('size') ?? '1080x1080',
  };
  await apply(config);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
