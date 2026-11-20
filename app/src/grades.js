// Colour grades for the cover maker. Each grade is a small palette that the
// renderer applies over the photos: a wash gradient, a sun disc, an accent
// used for the title underline, and a canvas filter for the photo itself.
// Nothing here is taken from any game; these are plain colour choices.

export const GRADES = {
  sunset: {
    name: 'Sunset',
    deep: '#1c0f2e',
    washTop: 'rgba(255, 122, 26, 0.20)',
    washBottom: 'rgba(214, 38, 120, 0.38)',
    sunTop: '#ffd166',
    sunBottom: '#ff5e3a',
    accent: '#ff7a1a',
    accent2: '#ff2e88',
    filter: 'saturate(1.35) contrast(1.08) brightness(1.02)',
    scrim: 'rgba(24, 8, 38, 0.88)',
  },
  neon: {
    name: 'Neon Night',
    deep: '#04041a',
    washTop: 'rgba(34, 230, 255, 0.16)',
    washBottom: 'rgba(255, 46, 136, 0.42)',
    sunTop: '#7df9ff',
    sunBottom: '#ff2e88',
    accent: '#22e6ff',
    accent2: '#ff2e88',
    filter: 'saturate(1.45) contrast(1.12) brightness(0.98)',
    scrim: 'rgba(4, 4, 26, 0.88)',
  },
  pink: {
    name: 'Vice Pink',
    deep: '#2b0a24',
    washTop: 'rgba(255, 120, 200, 0.22)',
    washBottom: 'rgba(140, 30, 160, 0.45)',
    sunTop: '#ffb3dd',
    sunBottom: '#e0218a',
    accent: '#ff6ec7',
    accent2: '#b967ff',
    filter: 'saturate(1.4) contrast(1.06) brightness(1.03)',
    scrim: 'rgba(43, 10, 36, 0.88)',
  },
  gold: {
    name: 'Golden Hour',
    deep: '#241505',
    washTop: 'rgba(255, 190, 60, 0.22)',
    washBottom: 'rgba(200, 80, 20, 0.40)',
    sunTop: '#fff3b0',
    sunBottom: '#ff9f1c',
    accent: '#ffc300',
    accent2: '#ff5e3a',
    filter: 'saturate(1.3) contrast(1.06) brightness(1.04)',
    scrim: 'rgba(36, 21, 5, 0.88)',
  },
};

export const GRADE_IDS = Object.keys(GRADES);
