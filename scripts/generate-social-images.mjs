import sharp from 'sharp';
import { readFile, mkdir } from 'node:fs/promises';
await mkdir('public/social', { recursive: true });
const art = (await readFile('public/illustrations/dithered-clock-transparent.png')).toString('base64');
const pages = {
 home: ['Your chief of staff,','on speed dial.','A personal AI assistant you can call.'],
 timeline: ['Your days,','brought together.','Connected accounts. A record with sources.'],
 speech: ['Speech time','calculator.','Turn words into minutes. Free, instant.'],
 privacy: ['Your information.','Your choices.','Vox privacy policy'],
 terms: ['Using Vox.','The essentials.','Vox terms of service'],
};
for (const [name, lines] of Object.entries(pages)) {
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#040506"/><text x="70" y="88" fill="#f4f1ea" font-family="Georgia" font-size="42">vox</text><text x="70" y="242" fill="#f4f1ea" font-family="Georgia" font-size="68">${lines[0]}</text><text x="70" y="325" fill="#ff7a5c" font-family="Georgia" font-style="italic" font-size="68">${lines[1]}</text><text x="70" y="416" fill="#bcb8af" font-family="Arial" font-size="24">${lines[2]}</text><text x="70" y="562" fill="#bcb8af" font-family="Arial" font-size="20">callvox.si</text><image x="780" y="115" width="370" height="370" href="data:image/png;base64,${art}"/></svg>`;
 await sharp(Buffer.from(svg)).png().toFile(`public/social/${name}.png`);
}
await sharp('public/vox.svg').resize(192,192).png().toFile('public/icon-192.png');
await sharp('public/vox.svg').resize(180,180).png().toFile('public/apple-touch-icon.png');
