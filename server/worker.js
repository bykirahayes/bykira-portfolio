const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' https://bykira-portfolio.safe-bream-3817.chatgpt.site; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self'; upgrade-insecure-requests",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const sessionCookie = 'kira_admin_session';
const publicAdminOrigins = new Set(['https://bykira.co.uk', 'https://www.bykira.co.uk']);
const encoder = new TextEncoder();

const toBase64Url = (bytes) => {
  let value = '';
  bytes.forEach((byte) => { value += String.fromCharCode(byte); });
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
};

const sha256 = async (value) => toBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
const safeEqual = (left, right) => {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) difference |= (a[index % a.length] || 0) ^ (b[index % b.length] || 0);
  return difference === 0;
};

const sign = async (payload, secret) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload))));
};

const createSession = async (env) => {
  const payload = toBase64Url(encoder.encode(JSON.stringify({ sub: 'kira', exp: Date.now() + 8 * 60 * 60 * 1000 })));
  return `${payload}.${await sign(payload, env.ADMIN_SESSION_SECRET)}`;
};

const readCookie = (request, name) => {
  const cookies = request.headers.get('Cookie') || '';
  return cookies.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || '';
};

const authenticated = async (request, env) => {
  const bearer = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  const value = bearer || readCookie(request, sessionCookie);
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !safeEqual(signature, await sign(payload, env.ADMIN_SESSION_SECRET))) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return data.sub === 'kira' && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
};

const validOrigin = (request) => {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin || publicAdminOrigins.has(origin);
};

const withAdminCors = (response, request) => {
  const origin = request.headers.get('Origin');
  if (!publicAdminOrigins.has(origin)) return response;
  const corsResponse = new Response(response.body, response);
  corsResponse.headers.set('Access-Control-Allow-Origin', origin);
  corsResponse.headers.set('Vary', 'Origin');
  return corsResponse;
};

const deviceFrom = (userAgent) => /Mobi|Android|iPhone|iPad/i.test(userAgent) ? 'Mobile / tablet' : 'Desktop';
const referrerOrigin = (value) => {
  if (!value) return null;
  try { return new URL(value).origin; } catch { return null; }
};

const initialiseDatabase = async (db) => {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS page_views (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT NOT NULL, referrer_origin TEXT, device TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_page_views_path_created_at ON page_views(path, created_at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS login_attempts (identifier_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL DEFAULT 0, window_started_at INTEGER NOT NULL, locked_until INTEGER NOT NULL DEFAULT 0)'),
  ]);
};

const login = async (request, env) => {
  if (!validOrigin(request) || request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') return new Response(null, { status: 403 });
  await initialiseDatabase(env.DB);
  const ipHash = await sha256(`${request.headers.get('CF-Connecting-IP') || 'unknown'}:${env.ADMIN_RATE_LIMIT_SECRET}`);
  const now = Math.floor(Date.now() / 1000);
  const attempt = await env.DB.prepare('SELECT attempts, window_started_at, locked_until FROM login_attempts WHERE identifier_hash = ?').bind(ipHash).first();
  if (attempt?.locked_until > now) return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429, headers: jsonHeaders });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400, headers: jsonHeaders }); }
  const passwordHash = await sha256(String(body.password || ''));
  const correct = safeEqual(String(body.username || ''), env.ADMIN_USERNAME)
    && safeEqual(String(body.email || '').toLowerCase(), env.ADMIN_EMAIL.toLowerCase())
    && safeEqual(passwordHash, env.ADMIN_PASSWORD_HASH);
  if (!correct) {
    const withinWindow = attempt && now - attempt.window_started_at < 900;
    const attempts = withinWindow ? attempt.attempts + 1 : 1;
    const lockedUntil = attempts >= 5 ? now + 900 : 0;
    await env.DB.prepare('INSERT INTO login_attempts (identifier_hash, attempts, window_started_at, locked_until) VALUES (?, ?, ?, ?) ON CONFLICT(identifier_hash) DO UPDATE SET attempts = excluded.attempts, window_started_at = excluded.window_started_at, locked_until = excluded.locked_until').bind(ipHash, attempts, withinWindow ? attempt.window_started_at : now, lockedUntil).run();
    return Response.json({ error: 'Those login details are not recognised.' }, { status: 401, headers: jsonHeaders });
  }
  await env.DB.prepare('DELETE FROM login_attempts WHERE identifier_hash = ?').bind(ipHash).run();
  const session = await createSession(env);
  return Response.json({ ok: true, token: session }, { headers: { ...jsonHeaders, 'Set-Cookie': `${sessionCookie}=${session}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` } });
};

const analytics = async (request, env) => {
  if (!await authenticated(request, env)) return Response.json({ error: 'Unauthorised' }, { status: 401, headers: jsonHeaders });
  try {
    const response = await fetch(`${env.ANALYTICS_COLLECTOR_URL}/api/analytics`, {
      headers: { Authorization: `Bearer ${env.ANALYTICS_READ_SECRET}` },
    });
    if (!response.ok) throw new Error('Collector unavailable');
    return new Response(response.body, { status: 200, headers: jsonHeaders });
  } catch {
    return Response.json({ error: 'Analytics are temporarily unavailable.' }, { status: 503, headers: jsonHeaders });
  }
};

const externalEvent = async (request, env) => {
  const origin = request.headers.get('Origin');
  if (origin !== 'https://bykira.co.uk' && origin !== 'https://www.bykira.co.uk') return new Response(null, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return new Response(null, { status: 400 }); }
  const path = String(body.path || '/').slice(0, 160);
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return new Response(null, { status: 400 });
  try {
    await initialiseDatabase(env.DB);
    await env.DB.prepare('INSERT INTO page_views (path, referrer_origin, device) VALUES (?, ?, ?)').bind(path, referrerOrigin(String(body.referrer || '')), deviceFrom(String(body.userAgent || ''))).run();
  } catch { return new Response(null, { status: 503 }); }
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Cache-Control': 'no-store' } });
};

const trackView = async (request, env, path) => {
  if (!env.DB || /bot|crawler|spider|preview/i.test(request.headers.get('User-Agent') || '')) return;
  try {
    await initialiseDatabase(env.DB);
    await env.DB.prepare('INSERT INTO page_views (path, referrer_origin, device) VALUES (?, ?, ?)').bind(path, referrerOrigin(request.headers.get('Referer')), deviceFrom(request.headers.get('User-Agent') || '')).run();
    if (Math.random() < 0.02) await env.DB.prepare("DELETE FROM page_views WHERE created_at < datetime('now','-13 months')").run();
  } catch { /* Analytics must never interrupt the public website. */ }
};

const staticPath = (pathname) => {
  if (pathname === '/') return '/index.html';
  if (pathname === '/work' || pathname === '/work/') return '/work/index.html';
  if (pathname === '/faq') return '/faq.html';
  if (pathname === '/services' || pathname === '/services/') return '/services/index.html';
  if (pathname === '/enquiry' || pathname === '/enquiry/') return '/enquiry/index.html';
  if (pathname === '/admin' || pathname === '/admin/') return '/admin/index.html';
  if (pathname === '/about' || pathname === '/about/') return '/about/index.html';
  if (pathname === '/privacy' || pathname === '/privacy/') return '/privacy/index.html';
  if (pathname === '/accessibility' || pathname === '/accessibility/') return '/accessibility/index.html';
  return pathname;
};

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/') && request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin');
      if (!publicAdminOrigins.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } });
    }
    if (url.pathname === '/api/login' && request.method === 'POST') return withAdminCors(await login(request, env), request);
    if (url.pathname === '/api/analytics' && request.method === 'GET') return withAdminCors(await analytics(request, env), request);
    if (url.pathname === '/api/me' && request.method === 'GET') return withAdminCors(Response.json({ authenticated: await authenticated(request, env) }, { headers: jsonHeaders }), request);
    if (url.pathname === '/api/logout' && request.method === 'POST' && validOrigin(request)) return withAdminCors(Response.json({ ok: true }, { headers: { ...jsonHeaders, 'Set-Cookie': `${sessionCookie}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` } }), request);
    if (url.pathname === '/faq.html') { url.pathname = '/faq'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/services.html') { url.pathname = '/services/'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/enquiry.html') { url.pathname = '/enquiry/'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/privacy.html') { url.pathname = '/privacy/'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/accessibility.html') { url.pathname = '/accessibility/'; return Response.redirect(url.toString(), 301); }
    const requestedPath = staticPath(url.pathname);
    url.pathname = requestedPath;
    const response = await env.ASSETS.fetch(new Request(url, request));
    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(securityHeaders)) secured.headers.set(name, value);
    if (requestedPath.startsWith('/admin/') || requestedPath.includes('/assets/admin-')) {
      secured.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      secured.headers.set('Pragma', 'no-cache');
      secured.headers.set('Expires', '0');
    }
    if (request.method === 'GET' && secured.status === 200 && secured.headers.get('Content-Type')?.includes('text/html') && !requestedPath.startsWith('/admin/')) context.waitUntil(trackView(request, env, new URL(request.url).pathname));
    return secured;
  },
};
