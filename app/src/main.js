// Wires the cover maker page: photos, panels, caption, grades, export.
// Photos are read on this machine with FileReader / object URLs and never
// leave it. The preview canvas is the live cover; dragging a panel pans
// its photo, the wheel zooms it, and the sliders do the same precisely.

import { renderCover, exportCoverPng } from './render.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { LAYOUTS, LAYOUT_IDS, PANEL_COUNT } from './layouts.js';
import { runShot } from './shots.js';

export const SIZES = {
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
  '1920x1080': [1920, 1080],
};

// One photo spread across the panels gets a different crop per panel, so a
// single shot reads as several framed moments instead of one tiled image.
const SPREAD_CROPS = [
  { zoom: 1.05, ox: 0, oy: 0.55 },
  { zoom: 1.35, ox: 0.6, oy: -0.35 },
  { zoom: 1.25, ox: -0.5, oy: 0.55 },
  { zoom: 1.4, ox: 0.55, oy: 0.5 },
];

const state = {
  layout: 'hero',
  grade: 'sunset',
  title: 'Sunset Heist',
  subtitle: 'Neon Nights',
  size: '1080x1080',
  panels: Array.from({ length: PANEL_COUNT }, () => ({ img: null, zoom: 1, ox: 0, oy: 0 })),
};
let selectedPanel = 0;

const preview = document.getElementById('preview');
const status = document.getElementById('status');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const zoomRange = document.getElementById('zoom');
const panXRange = document.getElementById('panx');
const panYRange = document.getElementById('pany');

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function emptySlot() {
  return { img: null, zoom: 1, ox: 0, oy: 0 };
}

function spreadPhoto(img) {
  state.panels = SPREAD_CROPS.map((crop) => ({ img, ...crop }));
}

function placePhoto(img, index) {
  state.panels[index] = { img, zoom: 1.15, ox: 0, oy: 0 };
}

/** Redraws the preview canvas at the chosen export size, scaled to fit. */
function redraw() {
  const [w, h] = SIZES[state.size];
  const scale = Math.min(1, 720 / Math.max(w, h));
  preview.width = Math.round(w * scale);
  preview.height = Math.round(h * scale);
  renderCover(preview, state, preview.width, preview.height);
  syncPanelButtons();
}

function currentLayout() {
  return LAYOUTS[state.layout];
}

function syncPanelButtons() {
  document.querySelectorAll('#panel-list button').forEach((button, i) => {
    const inLayout = i < currentLayout().panels.length;
    button.disabled = !inLayout;
    button.classList.toggle('selected', i === selectedPanel && inLayout);
    button.classList.toggle('filled', Boolean(state.panels[i].img));
  });
}

function selectPanel(i) {
  selectedPanel = i;
  const slot = state.panels[i];
  zoomRange.value = String(slot.zoom);
  panXRange.value = String(slot.ox);
  panYRange.value = String(slot.oy);
  document.getElementById('panel-name').textContent = `Panel ${i + 1}`;
  syncPanelButtons();
}

/** Which panel (if any) holds canvas point (x, y), in preview pixels. */
function hitPanel(x, y) {
  const panels = currentLayout().panels;
  for (let i = panels.length - 1; i >= 0; i -= 1) {
    const p = panels[i];
    if (x >= p.x * preview.width && x < (p.x + p.w) * preview.width
      && y >= p.y * preview.height && y < (p.y + p.h) * preview.height) return i;
  }
  return -1;
}

function clampSlot(slot) {
  slot.zoom = Math.min(3.5, Math.max(1, slot.zoom));
  slot.ox = Math.min(1, Math.max(-1, slot.ox));
  slot.oy = Math.min(1, Math.max(-1, slot.oy));
}

// --- dragging and zooming on the preview ---------------------------------

let drag = null;
preview.addEventListener('pointerdown', (event) => {
  const rect = preview.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (preview.width / rect.width);
  const y = (event.clientY - rect.top) * (preview.height / rect.height);
  const hit = hitPanel(x, y);
  if (hit === -1) return;
  selectPanel(hit);
  const slot = state.panels[hit];
  drag = { x, y, ox: slot.ox, oy: slot.oy, panel: currentLayout().panels[hit] };
  preview.setPointerCapture(event.pointerId);
});
preview.addEventListener('pointermove', (event) => {
  if (!drag) return;
  const rect = preview.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (preview.width / rect.width);
  const y = (event.clientY - rect.top) * (preview.height / rect.height);
  const slot = state.panels[selectedPanel];
  const pw = drag.panel.w * preview.width;
  const ph = drag.panel.h * preview.height;
  const iw = slot.img ? slot.img.naturalWidth : 1;
  const ih = slot.img ? slot.img.naturalHeight : 1;
  const base = Math.max(pw / iw, ph / ih);
  const overflowX = Math.max(1, (iw * base * slot.zoom - pw) / 2);
  const overflowY = Math.max(1, (ih * base * slot.zoom - ph) / 2);
  slot.ox = drag.ox + (x - drag.x) / overflowX;
  slot.oy = drag.oy + (y - drag.y) / overflowY;
  clampSlot(slot);
  zoomRange.value = String(slot.zoom);
  panXRange.value = String(slot.ox);
  panYRange.value = String(slot.oy);
  redraw();
});
preview.addEventListener('pointerup', () => { drag = null; });
preview.addEventListener('wheel', (event) => {
  event.preventDefault();
  const slot = state.panels[selectedPanel];
  slot.zoom *= Math.exp(-event.deltaY * 0.0012);
  clampSlot(slot);
  zoomRange.value = String(slot.zoom);
  redraw();
}, { passive: false });

// --- controls -------------------------------------------------------------

document.getElementById('layout-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-layout]');
  if (!button) return;
  state.layout = button.dataset.layout;
  if (selectedPanel >= currentLayout().panels.length) selectPanel(0);
  document.querySelectorAll('#layout-list button').forEach((b) => {
    b.classList.toggle('selected', b === button);
  });
  redraw();
});

document.getElementById('grade-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-grade]');
  if (!button) return;
  state.grade = button.dataset.grade;
  document.querySelectorAll('#grade-list button').forEach((b) => {
    b.classList.toggle('selected', b === button);
  });
  redraw();
});

document.getElementById('panel-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-panel]');
  if (!button || button.disabled) return;
  selectPanel(Number(button.dataset.panel));
});

document.querySelectorAll('input[name="size"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    state.size = radio.value;
    redraw();
  });
});

titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });

zoomRange.addEventListener('input', () => {
  const slot = state.panels[selectedPanel];
  slot.zoom = Number(zoomRange.value);
  clampSlot(slot);
  redraw();
});
panXRange.addEventListener('input', () => {
  const slot = state.panels[selectedPanel];
  slot.ox = Number(panXRange.value);
  clampSlot(slot);
  redraw();
});
panYRange.addEventListener('input', () => {
  const slot = state.panels[selectedPanel];
  slot.oy = Number(panYRange.value);
  clampSlot(slot);
  redraw();
});

document.getElementById('photo').addEventListener('change', async (event) => {
  const files = [...event.target.files];
  if (!files.length) return;
  let index = selectedPanel;
  for (const file of files) {
    try {
      const img = await loadImage(URL.createObjectURL(file));
      placePhoto(img, index % PANEL_COUNT);
      index += 1;
    } catch {
      status.textContent = `Could not read ${file.name}.`;
    }
  }
  status.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} loaded — drag a panel to position it.`;
  redraw();
});

async function loadSample(name) {
  const img = await loadImage(`samples/${name}.jpg`);
  spreadPhoto(img);
  status.textContent = `Sample photo "${name}" spread across the panels.`;
  redraw();
  return img;
}

document.getElementById('sample-boulevard').addEventListener('click', () => loadSample('boulevard'));
document.getElementById('sample-pier').addEventListener('click', () => loadSample('pier'));

document.getElementById('fill-all').addEventListener('click', () => {
  const slot = state.panels[selectedPanel];
  if (!slot.img) {
    status.textContent = 'Panel has no photo to spread — load one first.';
    return;
  }
  spreadPhoto(slot.img);
  status.textContent = 'One photo spread across every panel.';
  redraw();
});

document.getElementById('clear-panel').addEventListener('click', () => {
  state.panels[selectedPanel] = emptySlot();
  status.textContent = `Panel ${selectedPanel + 1} cleared.`;
  redraw();
});

document.getElementById('export').addEventListener('click', async () => {
  const [w, h] = SIZES[state.size];
  status.textContent = `Exporting ${w} x ${h}…`;
  try {
    const blob = await exportCoverPng(state, w, h);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-${w}x${h}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
    status.textContent = `Saved cover-${w}x${h}.png`;
  } catch {
    status.textContent = 'Export failed — try again.';
  }
});

// Test hook for headless checks: renders and returns the PNG as a data URL.
window.__exportPng = async (width, height) => {
  const blob = await exportCoverPng(state, width, height);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

// --- start ----------------------------------------------------------------

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, async (config) => {
    if (LAYOUT_IDS.includes(config.layout)) state.layout = config.layout;
    if (GRADE_IDS.includes(config.grade)) state.grade = config.grade;
    if (SIZES[config.size]) state.size = config.size;
    state.title = config.title;
    state.subtitle = config.subtitle;
    titleInput.value = config.title;
    subtitleInput.value = config.subtitle;
    document.querySelectorAll('#layout-list button').forEach((b) => {
      b.classList.toggle('selected', b.dataset.layout === state.layout);
    });
    document.querySelectorAll('#grade-list button').forEach((b) => {
      b.classList.toggle('selected', b.dataset.grade === state.grade);
    });
    document.querySelector(`input[name="size"][value="${state.size}"]`).checked = true;
    await loadSample(config.photo);
    if (shot === 'cover') {
      const [w, h] = SIZES[state.size];
      preview.width = w;
      preview.height = h;
      renderCover(preview, state, w, h);
    }
    selectPanel(0);
  });
} else {
  loadSample('pier').then(() => selectPanel(0));
}
