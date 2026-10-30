const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Output folder: the first argument, or brand/out next to this script. Needs rsvg-convert.
const OUT_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'out');
fs.mkdirSync(OUT_DIR, { recursive: true });

// 1. Horizontal Dark (Solid Background #0A0A0B)
const darkSvg = `<svg viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
  <rect width="1200" height="500" fill="#0A0A0B"/>
  <defs>
    <linearGradient id="gd" gradientUnits="userSpaceOnUse" x1="460" y1="180" x2="830" y2="395">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="1%" stop-color="#8C8C92"/>
    </linearGradient>
  </defs>
  <g transform="translate(36,163) scale(0.78) translate(-453,-174)" fill="none" stroke="url(#gd)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M830 197 L592 358 C560 378 500 380 475 340 C450 290 480 190 610 184 C700 182 760 230 765 300 C768 360 720 386 650 385"/>
    <circle cx="650" cy="319" r="66"/>
  </g>
  <text x="455" y="272" font-size="124" font-weight="800" letter-spacing="-2" fill="#F4F4F5">ASTra</text>
  <text x="466" y="325" font-size="27" letter-spacing="4.5" fill="#9A9AA2">BY ATTENTIONFORM</text>
  <text x="466" y="365" font-size="16" letter-spacing="2" fill="#6B6B72">HEADLESS OOXML DOCUMENT ENGINE</text>
</svg>`;

// 2. Horizontal Dark (Transparent Background)
const darkTransSvg = `<svg viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="gdt" gradientUnits="userSpaceOnUse" x1="460" y1="180" x2="830" y2="395">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="1%" stop-color="#8C8C92"/>
    </linearGradient>
  </defs>
  <g transform="translate(36,163) scale(0.78) translate(-453,-174)" fill="none" stroke="url(#gdt)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M830 197 L592 358 C560 378 500 380 475 340 C450 290 480 190 610 184 C700 182 760 230 765 300 C768 360 720 386 650 385"/>
    <circle cx="650" cy="319" r="66"/>
  </g>
  <text x="455" y="272" font-size="124" font-weight="800" letter-spacing="-2" fill="#F4F4F5">ASTra</text>
  <text x="466" y="325" font-size="27" letter-spacing="4.5" fill="#9A9AA2">BY ATTENTIONFORM</text>
  <text x="466" y="365" font-size="16" letter-spacing="2" fill="#6B6B72">HEADLESS OOXML DOCUMENT ENGINE</text>
</svg>`;

// 3. Horizontal Light (Solid Background #FFFFFF)
const lightSvg = `<svg viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
  <rect width="1200" height="500" fill="#FFFFFF"/>
  <defs>
    <linearGradient id="gl" gradientUnits="userSpaceOnUse" x1="460" y1="180" x2="830" y2="395">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="1%" stop-color="#6E6E74"/>
    </linearGradient>
  </defs>
  <g transform="translate(36,163) scale(0.78) translate(-453,-174)" fill="none" stroke="url(#gl)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M830 197 L592 358 C560 378 500 380 475 340 C450 290 480 190 610 184 C700 182 760 230 765 300 C768 360 720 386 650 385"/>
    <circle cx="650" cy="319" r="66"/>
  </g>
  <text x="455" y="272" font-size="124" font-weight="800" letter-spacing="-2" fill="#0A0A0B">ASTra</text>
  <text x="466" y="325" font-size="27" letter-spacing="4.5" fill="#6B6B72">BY ATTENTIONFORM</text>
  <text x="466" y="365" font-size="16" letter-spacing="2" fill="#8C8C92">HEADLESS OOXML DOCUMENT ENGINE</text>
</svg>`;

// 4. Horizontal Light (Transparent Background)
const lightTransSvg = `<svg viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="glt" gradientUnits="userSpaceOnUse" x1="460" y1="180" x2="830" y2="395">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="1%" stop-color="#6E6E74"/>
    </linearGradient>
  </defs>
  <g transform="translate(36,163) scale(0.78) translate(-453,-174)" fill="none" stroke="url(#glt)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M830 197 L592 358 C560 378 500 380 475 340 C450 290 480 190 610 184 C700 182 760 230 765 300 C768 360 720 386 650 385"/>
    <circle cx="650" cy="319" r="66"/>
  </g>
  <text x="455" y="272" font-size="124" font-weight="800" letter-spacing="-2" fill="#0A0A0B">ASTra</text>
  <text x="466" y="325" font-size="27" letter-spacing="4.5" fill="#6B6B72">BY ATTENTIONFORM</text>
  <text x="466" y="365" font-size="16" letter-spacing="2" fill="#8C8C92">HEADLESS OOXML DOCUMENT ENGINE</text>
</svg>`;

// 5. Standalone Icon (512x512) - Dark Background
const iconDarkSvg = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0A0A0B"/>
  <defs>
    <linearGradient id="gid" gradientUnits="userSpaceOnUse" x1="460" y1="180" x2="830" y2="395">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="1%" stop-color="#8C8C92"/>
    </linearGradient>
  </defs>
  <!-- Centered mark: scaled ~1.2x and centered at (256, 256) -->
  <g transform="translate(256, 256) scale(1.15) translate(-645, -286)" fill="none" stroke="url(#gid)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M830 197 L592 358 C560 378 500 380 475 340 C450 290 480 190 610 184 C700 182 760 230 765 300 C768 360 720 386 650 385"/>
    <circle cx="650" cy="319" r="66"/>
  </g>
</svg>`;

// 6. Standalone Icon (512x512) - Light Background
const iconLightSvg = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#FFFFFF"/>
  <defs>
    <linearGradient id="gil" gradientUnits="userSpaceOnUse" x1="460" y1="180" x2="830" y2="395">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="1%" stop-color="#6E6E74"/>
    </linearGradient>
  </defs>
  <g transform="translate(256, 256) scale(1.15) translate(-645, -286)" fill="none" stroke="url(#gil)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M830 197 L592 358 C560 378 500 380 475 340 C450 290 480 190 610 184 C700 182 760 230 765 300 C768 360 720 386 650 385"/>
    <circle cx="650" cy="319" r="66"/>
  </g>
</svg>`;

// 7. Standalone Icon (512x512) - Transparent Background (White / Silver Stroke)
const iconTransSvg = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="git" gradientUnits="userSpaceOnUse" x1="460" y1="180" x2="830" y2="395">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="1%" stop-color="#8C8C92"/>
    </linearGradient>
  </defs>
  <g transform="translate(256, 256) scale(1.15) translate(-645, -286)" fill="none" stroke="url(#git)" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M830 197 L592 358 C560 378 500 380 475 340 C450 290 480 190 610 184 C700 182 760 230 765 300 C768 360 720 386 650 385"/>
    <circle cx="650" cy="319" r="66"/>
  </g>
</svg>`;

// Files manifest
const files = [
  { name: 'astra-horizontal-dark', svg: darkSvg, w: 1200, h: 500 },
  { name: 'astra-horizontal-dark-transparent', svg: darkTransSvg, w: 1200, h: 500 },
  { name: 'astra-horizontal-light', svg: lightSvg, w: 1200, h: 500 },
  { name: 'astra-horizontal-light-transparent', svg: lightTransSvg, w: 1200, h: 500 },
  { name: 'astra-icon-dark', svg: iconDarkSvg, w: 512, h: 512 },
  { name: 'astra-icon-light', svg: iconLightSvg, w: 512, h: 512 },
  { name: 'astra-icon-transparent', svg: iconTransSvg, w: 512, h: 512 },
];

for (const f of files) {
  const svgPath = path.join(OUT_DIR, `${f.name}.svg`);
  const pngPath = path.join(OUT_DIR, `${f.name}.png`);
  fs.writeFileSync(svgPath, f.svg, 'utf8');
  execSync(`rsvg-convert -w ${f.w} -h ${f.h} "${svgPath}" -o "${pngPath}"`);
  console.log(`Rendered: ${f.name} (SVG + PNG)`);
}

// Generate Favicons & App Icons from iconDarkSvg
const favicons = [
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
];

const iconDarkPath = path.join(OUT_DIR, 'astra-icon-dark.svg');
for (const fav of favicons) {
  const favPath = path.join(OUT_DIR, fav.name);
  execSync(`rsvg-convert -w ${fav.size} -h ${fav.size} "${iconDarkPath}" -o "${favPath}"`);
  console.log(`Rendered favicon: ${fav.name}`);
}

// README documentation
const readme = `# ASTra by Attentionform: Official Brand Assets

Master vector and raster identity assets for **ASTra**, developed and maintained by **Attentionform**.

## Brand Palette & Specs

| Element | Dark Mode | Light Mode |
|---|---|---|
| **Background** | \`#0A0A0B\` (Obsidian) | \`#FFFFFF\` (Pure White) |
| **Mark Gradient** | \`#FFFFFF\` → \`#8C8C92\` | \`#000000\` → \`#6E6E74\` |
| **ASTra Wordmark** | \`#F4F4F5\` | \`#0A0A0B\` |
| **BY ATTENTIONFORM** | \`#9A9AA2\` | \`#6B6B72\` |
| **Subtitle Text** | \`#6B6B72\` | \`#8C8C92\` |
| **Primary Typeface** | Helvetica Neue / Inter / SF Pro Display |
| **Stroke Style** | 24px continuous monoline with rounded caps |

---

## Asset Directory

### 1. Master Dual-Mode Showcase (1200×1000)
* \`astra-final-v3.svg\`: Dual-mode master vector source
* \`astra-final-v3.png\`: High-resolution reference sheet

### 2. Horizontal Brand Lockups (1200×500)
* **Dark Mode Solid**: \`astra-horizontal-dark.svg\` · \`astra-horizontal-dark.png\`
* **Dark Mode Transparent**: \`astra-horizontal-dark-transparent.svg\` · \`astra-horizontal-dark-transparent.png\`
* **Light Mode Solid**: \`astra-horizontal-light.svg\` · \`astra-horizontal-light.png\`
* **Light Mode Transparent**: \`astra-horizontal-light-transparent.svg\` · \`astra-horizontal-light-transparent.png\`

### 3. Standalone Icons & Avatars (512×512)
* \`astra-icon-dark.svg\` · \`astra-icon-dark.png\` (Obsidian background)
* \`astra-icon-light.svg\` · \`astra-icon-light.png\` (White background)
* \`astra-icon-transparent.svg\` · \`astra-icon-transparent.png\` (Alpha channel)

### 4. App & Web Favicons
* \`favicon-32x32.png\` (Standard browser tab)
* \`favicon-16x16.png\` (Compact address bar)
* \`apple-touch-icon-180x180.png\` (iOS / macOS app bookmark)
`;

fs.writeFileSync(path.join(OUT_DIR, 'README.md'), readme, 'utf8');
console.log('README.md generated successfully.');
