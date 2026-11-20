// Panel layouts for the cover. A layout is a list of panels, each a rectangle
// in fractions of the cover (x, y, w, h), plus a short name for the editor.
// The renderer draws one photo per panel with a thin gutter between them,
// which is what gives the cover its multi-panel poster look.

export const LAYOUTS = {
  hero: {
    name: 'Hero + strip',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.58 },
      { x: 0, y: 0.58, w: 1 / 3, h: 0.42 },
      { x: 1 / 3, y: 0.58, w: 1 / 3, h: 0.42 },
      { x: 2 / 3, y: 0.58, w: 1 / 3, h: 0.42 },
    ],
  },
  grid: {
    name: 'Four squares',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  strips: {
    name: 'Three strips',
    panels: [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ],
  },
  duo: {
    name: 'Duo',
    panels: [
      { x: 0, y: 0, w: 0.56, h: 1 },
      { x: 0.56, y: 0, w: 0.44, h: 0.5 },
      { x: 0.56, y: 0.5, w: 0.44, h: 0.5 },
    ],
  },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

// How many photo slots the editor keeps, so a layout switch never loses a
// photo the user already placed.
export const PANEL_COUNT = 4;
