const allowedOrigins = new Set(['https://bykira.co.uk', 'https://www.bykira.co.uk']);
const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  Vary: 'Origin',
  'Cache-Control': 'no-store',
});

const initialiseDatabase = async (db) => {
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS page_views (id INTEGER PRIMARY KEY AUTOINCREMENT, path TEXT NOT NULL, referrer_origin TEXT, device TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_page_views_path_created_at ON page_views(path, created_at)'),
  ]);
};

const safeEqual = (left, right) => {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) difference |= (a[index % a.length] || 0) ^ (b[index % b.length] || 0);
  return difference === 0;
};

const referrerOrigin = (value) => {
  if (!value) return null;
  try { return new URL(value).origin; } catch { return null; }
};

const collect = async (request, env) => {
  const origin = request.headers.get('Origin');
  if (!allowedOrigins.has(origin)) return new Response(null, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return new Response(null, { status: 400 }); }
  const path = String(body.path || '/').slice(0, 160);
  if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return new Response(null, { status: 400 });
  await initialiseDatabase(env.DB);
  await env.DB.prepare('INSERT INTO page_views (path, referrer_origin, device) VALUES (?, ?, ?)').bind(
    path,
    referrerOrigin(String(body.referrer || '')),
    /Mobi|Android|iPhone|iPad/i.test(String(body.userAgent || '')) ? 'Mobile / tablet' : 'Desktop',
  ).run();
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
};

const report = async (request, env) => {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!token || !safeEqual(token, env.ANALYTICS_READ_SECRET || '')) return Response.json({ error: 'Unauthorised' }, { status: 401, headers: jsonHeaders });
  await initialiseDatabase(env.DB);
  const [summary, daily, pages, referrers, devices, recent] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS total, SUM(created_at >= datetime('now','-7 days')) AS last7, SUM(created_at >= datetime('now','-30 days')) AS last30 FROM page_views").first(),
    env.DB.prepare("SELECT date(created_at) AS day, COUNT(*) AS views FROM page_views WHERE created_at >= datetime('now','-29 days') GROUP BY day ORDER BY day").all(),
    env.DB.prepare('SELECT path, COUNT(*) AS views FROM page_views GROUP BY path ORDER BY views DESC LIMIT 8').all(),
    env.DB.prepare("SELECT COALESCE(referrer_origin, 'Direct / unknown') AS source, COUNT(*) AS views FROM page_views GROUP BY source ORDER BY views DESC LIMIT 8").all(),
    env.DB.prepare('SELECT device, COUNT(*) AS views FROM page_views GROUP BY device ORDER BY views DESC').all(),
    env.DB.prepare('SELECT path, device, referrer_origin, created_at FROM page_views ORDER BY id DESC LIMIT 15').all(),
  ]);
  return Response.json({ summary, daily: daily.results, pages: pages.results, referrers: referrers.results, devices: devices.results, recent: recent.results }, { headers: jsonHeaders });
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    if (url.pathname === '/api/event' && request.method === 'OPTIONS') {
      if (!allowedOrigins.has(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: { ...corsHeaders(origin), 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
    }
    if (url.pathname === '/api/event' && request.method === 'POST') return collect(request, env);
    if (url.pathname === '/api/analytics' && request.method === 'GET') return report(request, env);
    if (url.pathname === '/health') return Response.json({ ok: true }, { headers: jsonHeaders });
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
  },
};
