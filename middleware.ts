// Vercel Routing Middleware: server-side password protection for the whole
// site. Runs before every request (pages, CSS, JS, fonts, images), so
// nothing is served until the visitor has entered SITE_PASSWORD.
//
// - Password lives only in the SITE_PASSWORD environment variable.
// - Cookie holds HMAC-SHA256(SITE_PASSWORD, COOKIE_CONTEXT), never the
//   password. Changing the password invalidates every cookie.
// - Basic rate limiting: 5 failed tries per IP per minute (in memory, per
//   instance; best effort).
import { next } from '@vercel/functions';
import { loginPage, type LoginState } from './middleware-lib/login-page.ts';

declare const process: { env: Record<string, string | undefined> };

const COOKIE = 'pico_arch_auth';
const COOKIE_CONTEXT = 'pico-arch-v1';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const MAX_FAILS = 5;
const WINDOW_MS = 60_000;
const ROBOTS = 'noindex, nofollow, noarchive';

const fails = new Map<string, { count: number; until: number }>();

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const password = process.env.SITE_PASSWORD;

  // Tell every crawler to stay away; this file reveals nothing.
  if (url.pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': ROBOTS },
    });
  }

  if (!password) return login(request, 'missing-config', '/', 503);

  if (url.pathname === '/__logout') {
    return new Response(null, {
      status: 303,
      headers: {
        Location: new URL('/', url).toString(),
        'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
        'Cache-Control': 'no-store',
        'X-Robots-Tag': ROBOTS,
      },
    });
  }

  const expected = await sign(password);

  if (url.pathname === '/__auth' && request.method === 'POST') {
    const ip = clientIp(request);
    const form = await request.formData().catch(() => null);
    const nextPath = safeNext(String(form?.get('next') ?? '/'));
    if (isLimited(ip)) return login(request, 'limited', nextPath, 429);

    const given = await sign(String(form?.get('password') ?? ''));
    if (!timingSafeEqual(given, expected)) {
      recordFail(ip);
      await new Promise((r) => setTimeout(r, 400)); // slow down guessing
      return login(request, isLimited(ip) ? 'limited' : 'wrong', nextPath, isLimited(ip) ? 429 : 401);
    }

    fails.delete(ip);
    return new Response(null, {
      status: 303,
      headers: {
        Location: new URL(nextPath, url).toString(),
        'Set-Cookie': `${COOKIE}=${expected}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`,
        'Cache-Control': 'no-store',
        'X-Robots-Tag': ROBOTS,
      },
    });
  }

  if (timingSafeEqual(readCookie(request, COOKIE) ?? '', expected)) {
    return next({ headers: { 'X-Robots-Tag': ROBOTS } });
  }

  return login(request, 'idle', safeNext(url.pathname + url.search), 401);
}

/* ---------- helpers ---------- */

function login(request: Request, state: LoginState, nextPath: string, status: number): Response {
  const nonce = crypto.randomUUID().replace(/-/g, '');
  const html = request.method === 'HEAD' ? null : loginPage({ state, next: nextPath, nonce });
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': ROBOTS,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy':
        `default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:; ` +
        `script-src 'nonce-${nonce}'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`,
    },
  });
}

async function sign(value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(value), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(COOKIE_CONTEXT));
  return Array.from(new Uint8Array(mac), (b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

// Only same-site relative paths; never "//evil.com" or "/\evil.com".
function safeNext(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\') || path.startsWith('/__')) return '/';
  return path;
}

function clientIp(request: Request): string {
  return (request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown').trim();
}

function isLimited(ip: string): boolean {
  const f = fails.get(ip);
  if (!f) return false;
  if (Date.now() > f.until) { fails.delete(ip); return false; }
  return f.count >= MAX_FAILS;
}

function recordFail(ip: string) {
  const now = Date.now();
  const f = fails.get(ip);
  if (!f || now > f.until) fails.set(ip, { count: 1, until: now + WINDOW_MS });
  else f.count++;
  if (fails.size > 5000) for (const [k, v] of fails) if (now > v.until) fails.delete(k);
}
