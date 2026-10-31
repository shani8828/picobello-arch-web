// Exercises middleware.js with real Request objects (no Vercel needed).
// Run: npm run test:auth   (reads SITE_PASSWORD from .env.local)
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const env = readFileSync('.env.local', 'utf8').match(/^SITE_PASSWORD=(.*)$/m);
assert.ok(env, '.env.local must define SITE_PASSWORD');
process.env.SITE_PASSWORD = env[1].trim();
const { default: middleware } = await import('../middleware.js');

const base = 'https://arch.example.test';
const passes = (r) => r.headers.get('x-middleware-next') === '1';
const form = (fields, ip = '10.0.0.1') =>
  new Request(`${base}/__auth`, { method: 'POST', body: new URLSearchParams(fields), headers: { 'x-real-ip': ip } });

let n = 0;
async function t(name, fn) { await fn(); console.log(`  ok ${++n}  ${name}`); }

await t('page without cookie -> 401 login page, not the content', async () => {
  const r = await middleware(new Request(`${base}/`));
  assert.equal(r.status, 401);
  assert.ok(!passes(r));
  const html = await r.text();
  assert.match(html, /Platform architecture/);
  assert.match(html, /name="robots" content="noindex/);
  assert.equal(r.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  assert.equal(r.headers.get('cache-control'), 'no-store');
});

await t('assets without cookie are blocked too (css, js, fonts)', async () => {
  for (const p of ['/_astro/index.css', '/_astro/doc.js', '/_astro/inter.woff2', '/favicon.svg']) {
    const r = await middleware(new Request(base + p));
    assert.equal(r.status, 401, p);
    assert.ok(!passes(r), p);
  }
});

await t('wrong password -> 401 with clear error, no cookie', async () => {
  const r = await middleware(form({ password: 'nope', next: '/' }, '10.0.0.2'));
  assert.equal(r.status, 401);
  assert.equal(r.headers.get('set-cookie'), null);
  assert.match(await r.text(), /That password is not correct/);
});

let cookie;
await t('empty password -> clear error, no crash', async () => {
  const r = await middleware(form({ password: '', next: '/' }, '10.0.0.4'));
  assert.equal(r.status, 401);
  assert.match(await r.text(), /That password is not correct/);
});

await t('correct password -> 303 + HttpOnly Secure SameSite=Lax 30-day cookie with a hash', async () => {
  const r = await middleware(form({ password: process.env.SITE_PASSWORD, next: '/#api' }));
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), `${base}/#api`);
  const sc = r.headers.get('set-cookie');
  assert.match(sc, /^pico_arch_auth=[0-9a-f]{64};/);
  for (const attr of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Max-Age=2592000', 'Path=/']) assert.ok(sc.includes(attr), attr);
  assert.ok(!sc.includes(process.env.SITE_PASSWORD), 'cookie must not contain the password');
  cookie = sc.split(';')[0];
});

await t('valid cookie -> request passes through, with X-Robots-Tag', async () => {
  for (const p of ['/', '/_astro/doc.js']) {
    const r = await middleware(new Request(base + p, { headers: { cookie } }));
    assert.ok(passes(r), p);
    assert.equal(r.headers.get('x-robots-tag'), 'noindex, nofollow, noarchive');
  }
});

await t('tampered cookie is rejected', async () => {
  const bad = cookie.slice(0, -1) + (cookie.endsWith('0') ? '1' : '0');
  const r = await middleware(new Request(`${base}/`, { headers: { cookie: bad } }));
  assert.equal(r.status, 401);
});

await t('changing SITE_PASSWORD invalidates existing cookies', async () => {
  const old = process.env.SITE_PASSWORD;
  process.env.SITE_PASSWORD = old + '-rotated';
  const r = await middleware(new Request(`${base}/`, { headers: { cookie } }));
  process.env.SITE_PASSWORD = old;
  assert.equal(r.status, 401);
});

await t('open redirect via "next" is neutralised', async () => {
  for (const evil of ['//evil.com', 'https://evil.com', '/\\evil.com']) {
    const r = await middleware(form({ password: process.env.SITE_PASSWORD, next: evil }, '10.0.0.3'));
    assert.equal(r.headers.get('location'), `${base}/`, evil);
  }
});

await t('rate limit: 6th try within a minute -> 429, even with the right password', async () => {
  const ip = '10.0.0.9';
  for (let i = 0; i < 5; i++) await middleware(form({ password: 'x' + i }, ip));
  const r = await middleware(form({ password: process.env.SITE_PASSWORD }, ip));
  assert.equal(r.status, 429);
  assert.match(await r.text(), /Too many attempts/);
});

await t('logout clears the cookie', async () => {
  const r = await middleware(new Request(`${base}/__logout`, { headers: { cookie } }));
  assert.equal(r.status, 303);
  assert.match(r.headers.get('set-cookie'), /Max-Age=0/);
});

await t('missing SITE_PASSWORD fails closed (503, nothing served)', async () => {
  const old = process.env.SITE_PASSWORD;
  delete process.env.SITE_PASSWORD;
  const r = await middleware(new Request(`${base}/`, { headers: { cookie } }));
  process.env.SITE_PASSWORD = old;
  assert.equal(r.status, 503);
  assert.ok(!passes(r));
});

await t('password is not in the source code', async () => {
  for (const f of ['middleware.js']) {
    assert.ok(!readFileSync(f, 'utf8').includes(process.env.SITE_PASSWORD), f);
  }
});

console.log(`\n${n} checks passed.`);
