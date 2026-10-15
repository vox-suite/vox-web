import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/illustrations");
const N = 440;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const palette = ["#07080a", "#2a2024", "#4a3a3d", "#7b6a5c", "#b3a38b", "#efe2c3", "#fff6dc", "#6e2a52", "#b23c82", "#f472b6", "#f9b6d8"].map(hex);
const bayer = [
  [0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21],
];

async function dither(name, svg) {
  const { data, info } = await sharp(Buffer.from(svg)).resize(N, N).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height * 4);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if (data[i + 3] < 128) continue;
      const t = (bayer[y % 8][x % 8] / 64 - 0.5) * 70;
      const c = [data[i] + t, data[i + 1] + t, data[i + 2] + t];
      let best = 0, bd = 1e9;
      for (let p = 0; p < palette.length; p++) {
        const d = (c[0] - palette[p][0]) ** 2 + (c[1] - palette[p][1]) ** 2 + (c[2] - palette[p][2]) ** 2;
        if (d < bd) { bd = d; best = p; }
      }
      px[i] = palette[best][0]; px[i + 1] = palette[best][1]; px[i + 2] = palette[best][2]; px[i + 3] = 255;
    }
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize(1254, 1254, { kernel: "nearest" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(out, `${name}-transparent.png`));
  console.log(name);
}

const defs = `<defs>
<linearGradient id="cream" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3d6"/><stop offset=".55" stop-color="#e4d2a8"/><stop offset="1" stop-color="#8c7a62"/></linearGradient>
<linearGradient id="creamD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9c698"/><stop offset="1" stop-color="#4a3d33"/></linearGradient>
<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#d8c9a4"/></linearGradient>
<linearGradient id="pink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc2de"/><stop offset=".5" stop-color="#f472b6"/><stop offset="1" stop-color="#7d2a5c"/></linearGradient>
<radialGradient id="glass" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#4a3d44"/><stop offset="1" stop-color="#0a0809"/></radialGradient>
<radialGradient id="ball" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffd6ea"/><stop offset=".45" stop-color="#f472b6"/><stop offset="1" stop-color="#5a1f44"/></radialGradient>
</defs>`;

const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">${defs}${body}</svg>`;

const node = (x, y, w, h, fill = "url(#pink)") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${fill}" stroke="#141012" stroke-width="7"/>`;

const folder = wrap(`
<g transform="rotate(-12 500 520)">
  <path d="M150 330 Q150 292 188 292 H380 L420 250 H520 Q548 250 548 280 V292 H812 Q850 292 850 330 V760 Q850 800 810 800 H190 Q150 800 150 760Z" fill="url(#creamD)" stroke="#141012" stroke-width="9"/>
  <g transform="rotate(-4 500 470)">
    <rect x="215" y="215" width="560" height="470" rx="16" fill="url(#paper)" stroke="#141012" stroke-width="9"/>
    <path d="M410 340 H520 M410 340 V470 M520 340 H640" stroke="#141012" stroke-width="9" fill="none"/>
    ${node(270, 300, 140, 80)}${node(480, 300, 140, 80, "url(#cream)")}${node(620, 430, 120, 80)}${node(270, 450, 140, 80, "url(#cream)")}
    <path d="M410 340 H480 M620 340 Q690 340 690 430 M340 380 V450" stroke="#141012" stroke-width="9" fill="none"/>
    <rect x="270" y="580" width="330" height="18" rx="9" fill="#141012"/><rect x="270" y="620" width="230" height="18" rx="9" fill="#141012"/>
  </g>
  <path d="M150 470 Q150 440 190 440 H810 Q850 440 850 470 V760 Q850 800 810 800 H190 Q150 800 150 760Z" fill="url(#cream)" stroke="#141012" stroke-width="9"/>
  <rect x="210" y="500" width="210" height="50" rx="10" fill="url(#pink)" stroke="#141012" stroke-width="7"/>
  <rect x="210" y="590" width="360" height="16" rx="8" fill="#141012"/><rect x="210" y="628" width="260" height="16" rx="8" fill="#141012"/>
  <path d="M150 760 Q150 800 190 800 H810 Q850 800 850 760 V740 H150Z" fill="#141012" opacity=".28"/>
</g>`);

const magnifier = wrap(`
<defs><clipPath id="lens"><circle cx="560" cy="380" r="236"/></clipPath></defs>
<g stroke="#e8d9b4" stroke-width="10" fill="none" stroke-linecap="round">
  <path d="M130 690 L270 560 L190 340 M270 560 L430 680 L330 850"/>
</g>
${[[130, 690, 44], [270, 560, 52], [190, 340, 44], [430, 680, 48], [330, 850, 40]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#cream)" stroke="#141012" stroke-width="8"/>`).join("")}
<g transform="rotate(-40 560 380)">
  <rect x="530" y="600" width="62" height="270" rx="30" fill="url(#creamD)" stroke="#141012" stroke-width="9"/>
  <rect x="520" y="580" width="82" height="36" rx="12" fill="url(#pink)" stroke="#141012" stroke-width="7"/>
</g>
<circle cx="560" cy="380" r="250" fill="url(#glass)" stroke="#141012" stroke-width="10"/>
<g clip-path="url(#lens)">
<g transform="translate(560 380) scale(1.45) translate(-270 -560)">
  <path d="M270 560 L190 340 M270 560 L430 680" stroke="#fbeed0" stroke-width="8" fill="none" stroke-linecap="round"/>
  <circle cx="270" cy="560" r="46" fill="url(#ball)" stroke="#141012" stroke-width="6"/>
  <circle cx="190" cy="340" r="38" fill="url(#cream)" stroke="#141012" stroke-width="6"/>
  <circle cx="430" cy="680" r="42" fill="url(#cream)" stroke="#141012" stroke-width="6"/>
</g></g>
<circle cx="560" cy="380" r="250" fill="none" stroke="url(#cream)" stroke-width="34"/>
<circle cx="560" cy="380" r="267" fill="none" stroke="#141012" stroke-width="8"/>
<circle cx="560" cy="380" r="233" fill="none" stroke="#141012" stroke-width="6"/>
<path d="M420 250 Q460 190 530 170" stroke="#fff6dc" stroke-width="16" fill="none" stroke-linecap="round" opacity=".85"/>`);

const pins = wrap(`
<g transform="rotate(-8 300 480)"><rect x="110" y="330" width="360" height="400" rx="14" fill="url(#paper)" stroke="#141012" stroke-width="9"/>
<rect x="150" y="370" width="280" height="200" rx="8" fill="url(#cream)" stroke="#141012" stroke-width="7"/>
<rect x="150" y="610" width="240" height="18" rx="9" fill="#141012"/><rect x="150" y="650" width="170" height="18" rx="9" fill="#141012"/></g>
<g transform="rotate(7 720 400)"><rect x="540" y="200" width="330" height="360" rx="14" fill="url(#paper)" stroke="#141012" stroke-width="9"/>
<rect x="580" y="240" width="250" height="170" rx="8" fill="url(#creamD)" stroke="#141012" stroke-width="7"/>
<rect x="580" y="450" width="210" height="18" rx="9" fill="#141012"/><rect x="580" y="490" width="140" height="18" rx="9" fill="#141012"/></g>
<g transform="rotate(-3 640 760)"><rect x="470" y="640" width="320" height="260" rx="14" fill="url(#paper)" stroke="#141012" stroke-width="9"/>
<rect x="510" y="680" width="240" height="90" rx="8" fill="url(#pink)" stroke="#141012" stroke-width="7"/>
<rect x="510" y="810" width="190" height="18" rx="9" fill="#141012"/></g>
<path d="M300 360 C380 200 560 160 710 230 C800 280 760 520 650 690" stroke="#b23c82" stroke-width="14" fill="none" stroke-linecap="round"/>
<path d="M300 360 C380 200 560 160 710 230 C800 280 760 520 650 690" stroke="#f9b6d8" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="2 22"/>
${[[300, 360], [710, 230], [650, 690]].map(([x, y]) => `<ellipse cx="${x + 10}" cy="${y + 14}" rx="34" ry="14" fill="#141012" opacity=".5"/><circle cx="${x}" cy="${y}" r="38" fill="url(#ball)" stroke="#141012" stroke-width="8"/><circle cx="${x - 12}" cy="${y - 14}" r="10" fill="#fff6dc"/>`).join("")}`);

(async () => {
  await dither("dithered-folder", folder);
  await dither("dithered-lens", magnifier);
  await dither("dithered-pins", pins);
})();
