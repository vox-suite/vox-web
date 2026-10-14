import assert from 'node:assert/strict';
const base = process.argv[2] ?? 'http://127.0.0.1:3100';
const canonical = 'https://callvox.si';
const paths = ['/', '/timeline', '/download', '/speech-time-calculator', '/privacy-policy', '/terms-of-service'];
const titles = new Set(), descriptions = new Set();
function tag(html, name, value) {
  return [...html.matchAll(/<meta\s[^>]*>/g)].map(m => m[0]).find(t => t.includes(`${name}="${value}"`));
}
for (const path of paths) {
  const response = await fetch(`${base}${path}`); assert.equal(response.status, 200, path);
  const html = await response.text();
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1]; assert.ok(title, path); assert.ok(!titles.has(title), 'Duplicate title'); titles.add(title);
  const description = tag(html, 'name', 'description')?.match(/content="([^"]+)"/)?.[1]; assert.ok(description, path); assert.ok(!descriptions.has(description), 'Duplicate description'); descriptions.add(description);
  const canonicalTag = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  assert.equal(new URL(canonicalTag?.[1]).href, new URL(canonical + path).href, `Canonical ${path}`);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `One h1 ${path}`);
  const ogUrl = tag(html, "property", "og:url")?.match(/content="([^"]+)"/)?.[1];
  assert.equal(new URL(ogUrl).href, new URL(canonical + path).href, `OG URL ${path}`);
  assert.ok(tag(html, 'property', 'og:image')?.includes('/social/'), `PNG sharing image ${path}`);
  assert.ok(tag(html, 'name', 'twitter:card')?.includes('summary_large_image'), path);
  const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]; assert.ok(scripts.length, path);
  for (const match of scripts) JSON.parse(match[1]);
  console.log(`PASS ${path}: title, description, canonical, h1, social metadata, JSON-LD`);
}
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort(), paths.map(path=>canonical+path).sort());
assert.ok(!sitemap.includes('<lastmod>'), 'No build-time lastmod');
const robots = await (await fetch(`${base}/robots.txt`)).text();assert.ok(robots.includes(`Sitemap: ${canonical}/sitemap.xml`));assert.ok(robots.includes('Disallow: /api/'));
const missing = await fetch(`${base}/seo-verification-missing`);assert.equal(missing.status,404);assert.ok((await missing.text()).includes('content="noindex"'));
for(const image of ['home','timeline','speech','privacy','terms']) { const r=await fetch(`${base}/social/${image}.png`);assert.equal(r.status,200);assert.ok(r.headers.get('content-type')?.includes('image/png')); }
console.log('PASS sitemap, robots, 404/noindex and all sharing images');
