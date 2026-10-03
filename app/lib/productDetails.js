// Rule-based "product details" generator for phones and laptops.
//
// Given what the admin has picked in the product form (name/series, brand,
// condition, storage, screen size, OS, colours) it writes a ready-to-edit
// description. Known series (every iPhone generation, MacBooks, the common
// Android and Windows laptop families) get series-specific feature bullets;
// anything else gets a sensible generic description built from the fields
// that were filled in. Nothing here calls an external service.

import { normalizeCondition } from './condition';

// --- iPhone: one row per model, most specific key first -------------------
// [match key (lowercase), display, chip, camera, extra bullets]
const IPHONES = [
  ['iphone 17 pro max', '6.9-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A19 Pro chip', '48MP Fusion triple-camera system with 18MP Center Stage front camera', ['Aluminium unibody design with vapor-chamber cooling', 'USB-C', 'Face ID']],
  ['iphone 17 pro', '6.3-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A19 Pro chip', '48MP Fusion triple-camera system with 18MP Center Stage front camera', ['Aluminium unibody design with vapor-chamber cooling', 'USB-C', 'Face ID']],
  ['iphone 17', '6.3-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A19 chip', '48MP Fusion dual-camera system with 18MP Center Stage front camera', ['USB-C', 'Face ID', 'Ceramic Shield front']],
  ['iphone air', '6.5-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A19 Pro chip', '48MP Fusion single rear camera', ['Ultra-thin titanium design', 'USB-C', 'Face ID']],
  ['iphone 16 pro max', '6.9-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A18 Pro chip', '48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto', ['Titanium design', 'Camera Control button', 'Action button and USB-C']],
  ['iphone 16 pro', '6.3-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A18 Pro chip', '48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto', ['Titanium design', 'Camera Control button', 'Action button and USB-C']],
  ['iphone 16 plus', '6.7-inch Super Retina XDR OLED', 'A18 chip', '48MP Fusion + 12MP Ultra Wide', ['Camera Control button', 'Action button and USB-C', 'Face ID']],
  ['iphone 16e', '6.1-inch Super Retina XDR OLED', 'A18 chip', '48MP Fusion single rear camera', ['Action button and USB-C', 'Face ID', 'Apple-designed C1 modem']],
  ['iphone 16', '6.1-inch Super Retina XDR OLED', 'A18 chip', '48MP Fusion + 12MP Ultra Wide', ['Camera Control button', 'Action button and USB-C', 'Face ID']],
  ['iphone 15 pro max', '6.7-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A17 Pro chip', '48MP main + 12MP Ultra Wide + 12MP 5x Telephoto', ['Titanium design', 'Action button and USB-C', 'Dynamic Island']],
  ['iphone 15 pro', '6.1-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A17 Pro chip', '48MP main + 12MP Ultra Wide + 12MP 3x Telephoto', ['Titanium design', 'Action button and USB-C', 'Dynamic Island']],
  ['iphone 15 plus', '6.7-inch Super Retina XDR OLED', 'A16 Bionic chip', '48MP main + 12MP Ultra Wide', ['USB-C', 'Dynamic Island', 'Face ID']],
  ['iphone 15', '6.1-inch Super Retina XDR OLED', 'A16 Bionic chip', '48MP main + 12MP Ultra Wide', ['USB-C', 'Dynamic Island', 'Face ID']],
  ['iphone 14 pro max', '6.7-inch Super Retina XDR OLED with ProMotion and Always-On display', 'A16 Bionic chip', '48MP main + 12MP Ultra Wide + 12MP 3x Telephoto', ['Dynamic Island', 'Emergency SOS via satellite', 'Face ID']],
  ['iphone 14 pro', '6.1-inch Super Retina XDR OLED with ProMotion and Always-On display', 'A16 Bionic chip', '48MP main + 12MP Ultra Wide + 12MP 3x Telephoto', ['Dynamic Island', 'Emergency SOS via satellite', 'Face ID']],
  ['iphone 14 plus', '6.7-inch Super Retina XDR OLED', 'A15 Bionic chip', '12MP dual-camera system', ['Emergency SOS via satellite', 'Crash Detection', 'Face ID']],
  ['iphone 14', '6.1-inch Super Retina XDR OLED', 'A15 Bionic chip', '12MP dual-camera system', ['Emergency SOS via satellite', 'Crash Detection', 'Face ID']],
  ['iphone 13 pro max', '6.7-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A15 Bionic chip', '12MP triple-camera system with 3x telephoto and macro', ['Cinematic mode video', '5G', 'Face ID']],
  ['iphone 13 pro', '6.1-inch Super Retina XDR OLED with ProMotion (up to 120Hz)', 'A15 Bionic chip', '12MP triple-camera system with 3x telephoto and macro', ['Cinematic mode video', '5G', 'Face ID']],
  ['iphone 13 mini', '5.4-inch Super Retina XDR OLED', 'A15 Bionic chip', '12MP dual-camera system with sensor-shift stabilisation', ['Compact one-hand size', 'Cinematic mode video', '5G']],
  ['iphone 13', '6.1-inch Super Retina XDR OLED', 'A15 Bionic chip', '12MP dual-camera system with sensor-shift stabilisation', ['Cinematic mode video', '5G', 'Face ID']],
  ['iphone 12 pro max', '6.7-inch Super Retina XDR OLED', 'A14 Bionic chip', '12MP triple-camera system with LiDAR scanner', ['5G', 'Ceramic Shield front', 'MagSafe']],
  ['iphone 12 pro', '6.1-inch Super Retina XDR OLED', 'A14 Bionic chip', '12MP triple-camera system with LiDAR scanner', ['5G', 'Ceramic Shield front', 'MagSafe']],
  ['iphone 12 mini', '5.4-inch Super Retina XDR OLED', 'A14 Bionic chip', '12MP dual-camera system', ['Compact one-hand size', '5G', 'MagSafe']],
  ['iphone 12', '6.1-inch Super Retina XDR OLED', 'A14 Bionic chip', '12MP dual-camera system', ['5G', 'Ceramic Shield front', 'MagSafe']],
  ['iphone 11 pro max', '6.5-inch Super Retina XDR OLED', 'A13 Bionic chip', '12MP triple-camera system', ['Night mode photography', 'Face ID', 'Long battery life']],
  ['iphone 11 pro', '5.8-inch Super Retina XDR OLED', 'A13 Bionic chip', '12MP triple-camera system', ['Night mode photography', 'Face ID', 'Stainless steel frame']],
  ['iphone 11', '6.1-inch Liquid Retina LCD', 'A13 Bionic chip', '12MP dual-camera system', ['Night mode photography', 'Face ID', 'All-day battery life']],
  ['iphone xs max', '6.5-inch Super Retina OLED', 'A12 Bionic chip', '12MP dual-camera system', ['Face ID', 'Water resistant', 'Stainless steel frame']],
  ['iphone xs', '5.8-inch Super Retina OLED', 'A12 Bionic chip', '12MP dual-camera system', ['Face ID', 'Water resistant', 'Stainless steel frame']],
  ['iphone xr', '6.1-inch Liquid Retina LCD', 'A12 Bionic chip', '12MP single rear camera', ['Face ID', 'Water resistant', 'Long battery life']],
  ['iphone x', '5.8-inch Super Retina OLED', 'A11 Bionic chip', '12MP dual-camera system', ['Face ID', 'Wireless charging', 'Edge-to-edge display']],
  ['iphone se (3rd', '4.7-inch Retina HD LCD', 'A15 Bionic chip', '12MP single rear camera', ['Touch ID home button', '5G', 'Compact size']],
  ['iphone se (2nd', '4.7-inch Retina HD LCD', 'A13 Bionic chip', '12MP single rear camera', ['Touch ID home button', 'Wireless charging', 'Compact size']],
  ['iphone se', '4.7-inch Retina HD LCD', 'Apple A-series chip', '12MP single rear camera', ['Touch ID home button', 'Compact size']],
  ['iphone 8 plus', '5.5-inch Retina HD LCD', 'A11 Bionic chip', '12MP dual-camera system with Portrait mode', ['Touch ID home button', 'Wireless charging', 'Glass back']],
  ['iphone 8', '4.7-inch Retina HD LCD', 'A11 Bionic chip', '12MP rear camera', ['Touch ID home button', 'Wireless charging', 'Glass back']],
  ['iphone 7 plus', '5.5-inch Retina HD LCD', 'A10 Fusion chip', '12MP dual-camera system with Portrait mode', ['Touch ID home button', 'Water and dust resistant']],
  ['iphone 7', '4.7-inch Retina HD LCD', 'A10 Fusion chip', '12MP rear camera with optical image stabilisation', ['Touch ID home button', 'Water and dust resistant']],
  ['iphone 6s plus', '5.5-inch Retina HD LCD with 3D Touch', 'A9 chip', '12MP rear camera', ['Touch ID home button', '3D Touch']],
  ['iphone 6s', '4.7-inch Retina HD LCD with 3D Touch', 'A9 chip', '12MP rear camera', ['Touch ID home button', '3D Touch']],
  ['iphone 6 plus', '5.5-inch Retina HD LCD', 'A8 chip', '8MP iSight camera', ['Touch ID home button', 'Slim aluminium body']],
  ['iphone 6', '4.7-inch Retina HD LCD', 'A8 chip', '8MP iSight camera', ['Touch ID home button', 'Slim aluminium body']],
];

// --- Other phone families: matched by keyword ------------------------------
// [test, overview, bullets]
const PHONE_FAMILIES = [
  [/galaxy (z )?fold/, 'Samsung\'s book-style foldable — a phone that opens into a tablet-sized screen.', ['Foldable Dynamic AMOLED display', 'Multi-window multitasking', 'Premium flagship performance', 'Runs Samsung One UI on Android']],
  [/galaxy (z )?flip/, 'Samsung\'s compact clamshell foldable that folds down to pocket size.', ['Foldable Dynamic AMOLED display', 'Cover screen for quick glances', 'Flex mode for hands-free shooting', 'Runs Samsung One UI on Android']],
  [/galaxy note|\bnote ?\d+ ultra/, 'Samsung\'s productivity flagship, built around the S Pen.', ['Large Dynamic AMOLED display', 'S Pen support for notes and sketches', 'Flagship processor and camera system', 'Runs Samsung One UI on Android']],
  [/galaxy s\d+|samsung.*\bs\d{2}\b/, 'Samsung\'s Galaxy S flagship — top-tier display, camera and performance.', ['Bright Dynamic AMOLED display with high refresh rate', 'Flagship processor for smooth gaming and multitasking', 'Versatile multi-lens camera system', 'Runs Samsung One UI on Android']],
  [/galaxy a\d+|samsung.*\ba\d{2}\b/, 'Samsung\'s Galaxy A series — dependable everyday performance at a friendly price.', ['Vibrant AMOLED display', 'Large battery for all-day use', 'Capable multi-camera setup', 'Runs Samsung One UI on Android']],
  [/pixel/, 'Google\'s Pixel — clean Android and standout computational photography.', ['Google Tensor processor', 'Clean, fast Android experience', 'Excellent camera with Google\'s photo features', 'Long software-update support']],
  [/camon/, 'Tecno Camon — a camera-focused Android phone.', ['Large display with smooth refresh rate', 'Camera-first design with strong low-light photos', 'Big battery with fast charging', 'Runs Android with HiOS']],
  [/phantom/, 'Tecno Phantom — Tecno\'s premium flagship line.', ['Premium display and build', 'Powerful processor and camera system', 'Fast charging', 'Runs Android with HiOS']],
  [/spark|pova/, 'Tecno — dependable everyday phone with great value and battery life.', ['Large display', 'Big battery for long days', 'Capable rear and selfie cameras', 'Runs Android with HiOS']],
  [/infinix.*(zero|gt)|\bzero\b/, 'Infinix Zero — Infinix\'s camera- and performance-focused series.', ['Bright AMOLED display', 'High-resolution main camera', 'Fast charging', 'Runs Android with XOS']],
  [/infinix|\bhot ?\d|\bsmart ?\d/, 'Infinix — big-battery, good-value Android phone.', ['Large display', 'Big battery with fast charging', 'Capable rear and selfie cameras', 'Runs Android with XOS']],
  [/redmi|poco|xiaomi|\bmi\b/, 'Xiaomi — strong specs and value for the price.', ['Sharp high-refresh-rate display', 'Strong performance for the price', 'Multi-camera system', 'Fast charging on supported models']],
  [/itel/, 'itel — affordable, battery-friendly Android phone.', ['Large display', 'Long-lasting battery', 'Everyday dual cameras', 'Runs Android']],
  [/oppo|reno|find x/, 'Oppo — stylish design with strong cameras and fast charging.', ['Vibrant AMOLED display', 'Strong portrait and selfie cameras', 'Fast charging', 'Runs Android with ColorOS']],
  [/vivo/, 'Vivo — camera-focused phone with a slim, premium feel.', ['Bright AMOLED display', 'Strong camera system', 'Fast charging', 'Runs Android with Funtouch OS']],
  [/oneplus/, 'OnePlus — flagship-level speed and smooth software.', ['Fluid high-refresh-rate AMOLED display', 'Flagship processor', 'Very fast charging', 'Clean, quick Android experience']],
  [/huawei|honor/, 'A well-built phone with a strong camera system and long battery life.', ['Sharp display', 'Strong camera system', 'Long battery life', 'Fast charging']],
  [/realme/, 'Realme — performance and fast charging at a friendly price.', ['Smooth high-refresh-rate display', 'Fast charging', 'Capable multi-camera setup', 'Runs Android']],
];

// --- Laptop families: matched by keyword ----------------------------------
const LAPTOP_FAMILIES = [
  [/macbook air/, 'Apple MacBook Air — thin, light and fanless with all-day battery life.', ['Liquid Retina display', 'Apple silicon performance with long battery life', 'Silent fanless design', 'Backlit Magic Keyboard and Touch ID']],
  [/macbook pro/, 'Apple MacBook Pro — pro-level performance for creators and developers.', ['Bright, colour-accurate Retina display', 'Apple silicon performance with long battery life', 'Excellent speakers and studio-quality mics', 'Backlit Magic Keyboard and Touch ID']],
  [/macbook/, 'Apple MacBook — premium build and a smooth macOS experience.', ['Sharp Retina display', 'Responsive keyboard and Force Touch trackpad', 'Excellent battery life for its size', 'Runs macOS']],
  [/xps/, 'Dell XPS — Dell\'s premium ultrabook with a near edge-to-edge display.', ['Slim, premium aluminium build', 'Sharp, bright display', 'Strong performance for work and creative tasks', 'Backlit keyboard']],
  [/latitude|vostro/, 'Dell business laptop — durable, secure and dependable for work.', ['Business-grade build quality', 'Comfortable backlit keyboard', 'Reliable performance for office and remote work', 'Good port selection']],
  [/inspiron/, 'Dell Inspiron — everyday laptop for study, work and entertainment.', ['Crisp full-HD display', 'Dependable everyday performance', 'Comfortable keyboard', 'Good port selection']],
  [/spectre/, 'HP Spectre x360 — premium 2-in-1 that turns from laptop to tablet.', ['Convertible 360° hinge', 'Sharp, bright touchscreen', 'Premium gem-cut aluminium design', 'Long battery life']],
  [/elitebook|probook/, 'HP business laptop — secure, durable and built for the workday.', ['Business-grade build quality', 'Comfortable backlit keyboard', 'Reliable performance for office work', 'Security features for business use']],
  [/pavilion|envy/, 'HP — stylish everyday laptop with solid performance.', ['Crisp full-HD display', 'Dependable everyday performance', 'Comfortable keyboard', 'Good battery life']],
  [/thinkpad/, 'Lenovo ThinkPad — legendary keyboard and rugged business build.', ['Excellent, comfortable keyboard', 'Durable, tested build quality', 'Reliable performance for professional use', 'TrackPoint and security features']],
  [/ideapad/, 'Lenovo IdeaPad — everyday laptop for study, work and streaming.', ['Crisp full-HD display', 'Dependable everyday performance', 'Comfortable keyboard', 'Good battery life']],
  [/legion/, 'Lenovo Legion — gaming laptop with serious cooling and performance.', ['High-refresh-rate gaming display', 'Dedicated graphics for modern games', 'Strong cooling system', 'Backlit gaming keyboard']],
  [/yoga/, 'Lenovo Yoga — flexible 2-in-1 that folds from laptop to tablet.', ['360° convertible hinge', 'Touchscreen display', 'Slim, premium design', 'Good battery life']],
  [/zenbook/, 'Asus ZenBook — slim, premium ultrabook with a gorgeous display.', ['Slim, lightweight premium build', 'Sharp, colour-rich display', 'Strong everyday performance', 'Backlit keyboard']],
  [/vivobook/, 'Asus VivoBook — thin, colourful everyday laptop.', ['Crisp full-HD display', 'Dependable everyday performance', 'Comfortable keyboard', 'Light and portable']],
  [/rog|tuf/, 'Asus gaming laptop — built for high frame rates and long sessions.', ['High-refresh-rate gaming display', 'Dedicated graphics for modern games', 'Strong cooling system', 'Backlit gaming keyboard']],
  [/predator|nitro/, 'Acer gaming laptop — high performance for gaming and creative work.', ['High-refresh-rate gaming display', 'Dedicated graphics for modern games', 'Strong cooling system', 'Backlit gaming keyboard']],
  [/aspire|swift/, 'Acer — good-value laptop for study, work and everyday use.', ['Crisp full-HD display', 'Dependable everyday performance', 'Comfortable keyboard', 'Light and portable']],
  [/surface/, 'Microsoft Surface — premium design with a touch-friendly display.', ['PixelSense touchscreen display', 'Premium, slim build', 'Great for work and note-taking', 'Runs Windows']],
  [/msi/, 'MSI laptop — built for gaming and creative workloads.', ['Fast display for gaming and creative work', 'Strong processor and graphics options', 'Effective cooling', 'Backlit keyboard']],
  [/razer/, 'Razer Blade — premium gaming laptop in a slim aluminium body.', ['High-refresh-rate display', 'Dedicated high-end graphics', 'Premium CNC aluminium build', 'Per-key RGB keyboard']],
  [/galaxy book/, 'Samsung Galaxy Book — slim, light laptop with a vivid AMOLED display.', ['Vibrant display', 'Slim, lightweight design', 'Good battery life', 'Works well with Galaxy phones']],
  [/toshiba|dynabook|satellite/, 'Toshiba — dependable, no-nonsense laptop for work and study.', ['Comfortable keyboard', 'Reliable everyday performance', 'Good port selection', 'Solid build']],
];

const GENERIC_PHONE = ['Sharp, responsive display', 'Capable rear and selfie cameras', 'Smooth everyday performance', 'Battery that lasts through the day'];
const GENERIC_LAPTOP = ['Crisp display', 'Reliable everyday performance', 'Comfortable keyboard and trackpad', 'Good battery life and portability'];

function cleanName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
}

function findIphone(n) {
  return IPHONES.find(([key]) => n.includes(key)) || null;
}

function findFamily(list, n) {
  return list.find(([test]) => test.test(n)) || null;
}

function conditionLines(condition) {
  const c = normalizeCondition(condition);
  if (c === 'new') {
    return { tag: 'Brand new', note: 'Brand new unit, ready to use.' };
  }
  if (c === 'refurbished') {
    return { tag: 'Refurbished', note: 'Refurbished — inspected, tested and restored to full working order before listing.' };
  }
  if (c === 'lla') {
    return { tag: 'LLA', note: 'LLA — US-spec (LL/A) model unit.' };
  }
  if (c === 'used') {
    return { tag: 'Grade A (used)', note: 'Grade A (used) — in clean, well-kept condition and tested to be fully working before listing.' };
  }
  return { tag: '', note: '' };
}

function formatInches(inches) {
  const v = String(inches || '').trim();
  if (!v) return '';
  return /^[\d.]+$/.test(v) ? `${v}-inch` : v;
}

// input: { name, brand, category, condition, storage, inches, operatingSystem, colors }
// Returns '' when there is nothing sensible to generate (e.g. not a phone or
// laptop, or no name typed yet).
export function generateProductDetails(input) {
  const { name = '', brand = '', category = '', condition = '', storage = '', inches = '', operatingSystem = '', colors = [] } =
    input || {};

  if (category !== 'phones' && category !== 'laptops') return '';
  const trimmedName = String(name).trim();
  if (trimmedName.length < 3) return '';

  const n = cleanName(`${brand} ${trimmedName}`);
  const cond = conditionLines(condition);
  const title = cond.tag ? `${trimmedName} — ${cond.tag}` : trimmedName;

  let overview = '';
  const highlights = [];

  if (category === 'phones') {
    const iphone = findIphone(n);
    if (iphone) {
      const [, display, chip, camera, extras] = iphone;
      overview = `${trimmedName} — Apple's smartphone with a ${display.split(' ')[0].replace('-inch', '"')} screen, powered by the ${chip}.`;
      highlights.push(`Display: ${display}`, `Performance: ${chip}`, `Camera: ${camera}`, ...extras);
    } else {
      const family = findFamily(PHONE_FAMILIES, n);
      overview = family
        ? family[1]
        : `${trimmedName}${brand ? ` from ${brand}` : ''} — a dependable smartphone for calls, social media, photos and everyday apps.`;
      highlights.push(...(family ? family[2] : GENERIC_PHONE));
    }
  } else {
    const family = findFamily(LAPTOP_FAMILIES, n);
    overview = family
      ? family[1]
      : `${trimmedName}${brand ? ` from ${brand}` : ''} — a dependable laptop for work, study and entertainment.`;
    highlights.push(...(family ? family[2] : GENERIC_LAPTOP));

    const chipMatch = n.match(/\bm([1-5])\b(?: (pro|max|ultra))?/);
    if (n.includes('macbook') && chipMatch) {
      const suffix = chipMatch[2] ? ` ${chipMatch[2][0].toUpperCase()}${chipMatch[2].slice(1)}` : '';
      highlights.unshift(`Chip: Apple M${chipMatch[1]}${suffix}`);
    }
  }

  const specs = [];
  const screen = formatInches(inches);
  if (screen && category === 'laptops') specs.push(`Screen size: ${screen}`);
  if (storage) specs.push(`Storage: ${storage}`);
  if (operatingSystem) specs.push(`Operating system: ${operatingSystem}`);
  if (Array.isArray(colors) && colors.length > 0) specs.push(`Available colours: ${colors.join(', ')}`);
  if (cond.tag) specs.push(`Condition: ${cond.tag}`);

  const lines = [title, '', overview, '', 'Key features'];
  highlights.forEach((h) => lines.push(`• ${h}`));
  if (specs.length > 0) {
    lines.push('', 'Specs');
    specs.forEach((s) => lines.push(`• ${s}`));
  }
  if (cond.note) lines.push('', cond.note);

  return lines.join('\n');
}
