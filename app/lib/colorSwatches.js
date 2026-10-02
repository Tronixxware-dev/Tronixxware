// Best-effort color name → swatch color, shared between the admin product
// form and the storefront so a color picked there renders identically here.
// Anything not listed here falls back to trying the typed name as a CSS
// color (works fine for "Red", "Black", "Silver", etc.).
export const COLOR_SWATCHES = {
  black: '#1c1c1e',
  white: '#f5f5f7',
  silver: '#e3e4e5',
  gold: '#f0e2cf',
  'rose gold': '#b76e79',
  graphite: '#54524f',
  grey: '#8e8e93',
  gray: '#8e8e93',
  'space grey': '#5f5f5f',
  'space gray': '#5f5f5f',
  midnight: '#1c1c22',
  starlight: '#f3ecdf',
  'sierra blue': '#a9c3d6',
  'alpine green': '#5e6957',
  titanium: '#8a8a86',
  'natural titanium': '#8a8a86',
  'blue titanium': '#3f4a58',
  'desert titanium': '#a08d6f',
  'white titanium': '#e7e5e0',
  navy: '#1f2a44',
  beige: '#e8dcc8',
};

export function swatchFor(name) {
  return COLOR_SWATCHES[name.trim().toLowerCase()] || name;
}

// Splits the comma-separated colorOption string stored on a product into a
// clean list of individual color names, e.g. "Blue, Green, Red" -> [...]
export function parseColors(colorOption) {
  if (!colorOption) return [];
  return colorOption
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}
