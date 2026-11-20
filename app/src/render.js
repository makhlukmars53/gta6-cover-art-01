// Draws the multi-panel cover onto a canvas. Everything is canvas-drawn:
// the photos, the grade wash, a synthwave sun disc, the gutters and the
// bold caption lettering. No image, font or other asset is fetched to draw
// it; the only images ever drawn are the user's own photos (or the kit's
// two sample photos) passed in through the state.

import { GRADES } from './grades.js';
import { LAYOUTS } from './layouts.js';

const TITLE_FONT = `'Arial Black', Impact, 'Helvetica Neue', Arial, sans-serif`;
const BODY_FONT = `'Helvetica Neue', Arial, sans-serif`;

/** Draws the whole cover for `state` at `width` x `height` on `canvas`. */
export function renderCover(canvas, state, width, height) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.hero;
  const w = width;
  const h = height;
  const gutter = Math.max(2, Math.round(w * 0.008));

  ctx.fillStyle = grade.deep;
  ctx.fillRect(0, 0, w, h);

  layout.panels.forEach((panel, i) => {
    const rect = {
      x: Math.round(panel.x * w + gutter / 2),
      y: Math.round(panel.y * h + gutter / 2),
      w: Math.round(panel.w * w - gutter),
      h: Math.round(panel.h * h - gutter),
    };
    drawPanel(ctx, state.panels[i], rect, grade, i);
  });

  drawSun(ctx, state.layout, layout.panels[0], w, h, grade, gutter);
  drawTitleBand(ctx, state, w, h, grade);
}

/** One panel: its photo (cover-fit, zoomed and panned) or a placeholder. */
function drawPanel(ctx, slot, rect, grade, index) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();

  if (slot && slot.img) {
    const iw = slot.img.naturalWidth;
    const ih = slot.img.naturalHeight;
    const base = Math.max(rect.w / iw, rect.h / ih);
    const zoom = slot.zoom ?? 1;
    const sw = iw * base * zoom;
    const sh = ih * base * zoom;
    const ox = (slot.ox ?? 0) * Math.max(0, (sw - rect.w) / 2);
    const oy = (slot.oy ?? 0) * Math.max(0, (sh - rect.h) / 2);
    ctx.filter = grade.filter;
    ctx.drawImage(slot.img, rect.x + rect.w / 2 - sw / 2 + ox, rect.y + rect.h / 2 - sh / 2 + oy, sw, sh);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = grade.deep;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = Math.max(1, rect.w * 0.004);
    ctx.setLineDash([rect.w * 0.03, rect.w * 0.02]);
    ctx.strokeRect(rect.x + 6, rect.y + 6, rect.w - 12, rect.h - 12);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = `bold ${Math.max(11, Math.round(rect.h * 0.07))}px ${BODY_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`PANEL ${index + 1} — ADD A PHOTO`, rect.x + rect.w / 2, rect.y + rect.h / 2);
  }

  // Grade wash: warm on top, deep colour at the foot of the panel.
  const wash = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  wash.addColorStop(0, grade.washTop);
  wash.addColorStop(1, grade.washBottom);
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);

  // Vignette so each panel reads as its own framed shot.
  const vig = ctx.createRadialGradient(
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
    rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75,
  );
  vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vig.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
  ctx.fillStyle = vig;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

/** A striped sun disc in the top corner of the first panel. On the wide hero
    panel it sits whole in the sky; on the other layouts it bleeds off the
    corner as a quarter disc, so it never sits on a face. */
function drawSun(ctx, layout, firstPanel, w, h, grade, gutter) {
  const px = firstPanel.x * w;
  const py = firstPanel.y * h;
  const pw = firstPanel.w * w;
  const ph = firstPanel.h * h;
  const r = Math.min(pw, ph) * 0.22;
  const hero = layout === 'hero';
  const cx = hero ? px + pw - r * 1.05 - gutter : px + pw - r * 0.05;
  const cy = hero ? py + r * 1.0 : py + r * 0.05;
  if (r < 12) return;
  ctx.save();
  // Keep the disc inside the first panel, whatever its corner.
  ctx.beginPath();
  ctx.rect(Math.round(px + gutter / 2), Math.round(py + gutter / 2),
    Math.round(pw - gutter), Math.round(ph - gutter));
  ctx.clip();
  ctx.shadowColor = grade.accent;
  ctx.shadowBlur = r * 0.45;
  const sun = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  sun.addColorStop(0, grade.sunTop);
  sun.addColorStop(1, grade.sunBottom);
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Slats across the lower half, clipped to the disc so none sticks out.
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = grade.deep;
  let y = cy + r * 0.05;
  let thick = Math.max(1, r * 0.04);
  while (y < cy + r) {
    ctx.fillRect(cx - r - 2, y, r * 2 + 4, thick);
    y += thick + Math.max(2, r * 0.09);
    thick *= 1.5;
  }
  ctx.restore();
}

/** The caption band across the foot: scrim, subtitle, big title, accent bar. */
function drawTitleBand(ctx, state, w, h, grade) {
  const bandH = h * 0.24;
  const scrim = ctx.createLinearGradient(0, h - bandH, 0, h);
  scrim.addColorStop(0, 'rgba(0, 0, 0, 0)');
  scrim.addColorStop(0.55, grade.scrim);
  scrim.addColorStop(1, grade.scrim);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h - bandH, w, bandH);

  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim().toUpperCase();
  const cx = w / 2;
  const baseY = h - h * 0.055;

  if (subtitle) {
    let subSize = Math.max(12, Math.round(h * 0.028));
    ctx.font = `bold ${subSize}px ${BODY_FONT}`;
    try { ctx.letterSpacing = `${Math.round(subSize * 0.42)}px`; } catch { /* older canvas */ }
    while (ctx.measureText(subtitle).width > w * 0.9 && subSize > 10) {
      subSize -= 1;
      ctx.font = `bold ${subSize}px ${BODY_FONT}`;
      try { ctx.letterSpacing = `${Math.round(subSize * 0.42)}px`; } catch { /* older canvas */ }
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = grade.accent;
    ctx.fillText(subtitle, cx, baseY - h * 0.115);
    try { ctx.letterSpacing = '0px'; } catch { /* older canvas */ }
  }

  if (title) {
    let size = Math.round(h * 0.115);
    ctx.font = `900 ${size}px ${TITLE_FONT}`;
    while (ctx.measureText(title).width > w * 0.92 && size > 14) {
      size -= 2;
      ctx.font = `900 ${size}px ${TITLE_FONT}`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    // Accent echo behind the white letters, then a dark outline.
    ctx.fillStyle = grade.accent2;
    ctx.fillText(title, cx + size * 0.045, baseY + size * 0.045);
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10, 4, 20, 0.9)';
    ctx.strokeText(title, cx, baseY);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, cx, baseY);
    // Accent bar under the title.
    const barW = Math.min(w * 0.5, ctx.measureText(title).width * 0.62);
    const barH = Math.max(3, h * 0.008);
    const bar = ctx.createLinearGradient(cx - barW / 2, 0, cx + barW / 2, 0);
    bar.addColorStop(0, grade.accent);
    bar.addColorStop(1, grade.accent2);
    ctx.fillStyle = bar;
    ctx.fillRect(cx - barW / 2, baseY + h * 0.018, barW, barH);
  }
}

/** Renders the cover at `width` x `height` and resolves with a PNG blob. */
export function exportCoverPng(state, width, height) {
  const canvas = document.createElement('canvas');
  renderCover(canvas, state, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))), 'image/png');
  });
}
