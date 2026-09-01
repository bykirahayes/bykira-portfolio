const ALLOWED_ORIGINS = new Set(['https://bykira.co.uk', 'https://www.bykira.co.uk']);
const SERVICES = new Set(['Landing page', 'Business or portfolio website', 'Custom website', 'Redesign of an existing site', 'Not sure yet']);
const BUDGETS = new Set(['£500–£1,000', '£1,000–£2,500', '£2,500–£5,000', '£5,000+', 'I need guidance']);

function reply(origin, status, body) {
  const headers = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", 'Referrer-Policy': 'no-referrer', Vary: 'Origin', 'X-Content-Type-Options': 'nosniff' };
  return body === null ? new Response(null, { status, headers }) : Response.json(body, { status, headers });
}
function clean(value, max) { const result = typeof value === 'string' ? value.trim() : ''; return result.length <= max ? result : ''; }
function validUrl(value) { if (!value) return true; try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } }

export default { async fetch(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.has(origin)) return reply('', 403, { ok: false, message: 'Request not allowed.' });
  if (request.method === 'OPTIONS') return reply(origin, 204, null);
  if (request.method !== 'POST' || new URL(request.url).pathname !== '/enquiry') return reply(origin, 404, { ok: false, message: 'Not found.' });
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply(origin, 415, { ok: false, message: 'Invalid request.' });
  if (Number(request.headers.get('Content-Length') || 0) > 16384) return reply(origin, 413, { ok: false, message: 'Request too large.' });
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!(await env.ENQUIRY_RATE_LIMITER.limit({ key: ip })).success) return reply(origin, 429, { ok: false, message: 'Too many attempts. Please wait and try again.' });
  let raw, input;
  try { raw = await request.text(); input = JSON.parse(raw); } catch { return reply(origin, 400, { ok: false, message: 'Invalid request.' }); }
  if (new TextEncoder().encode(raw).length > 16384) return reply(origin, 413, { ok: false, message: 'Request too large.' });
  if (clean(input.companyWebsite, 200)) return reply(origin, 200, { ok: true });
  const data = { name: clean(input.name, 100), email: clean(input.email, 254), business: clean(input.business, 150), service: clean(input.service, 100), budget: clean(input.budget, 100), launch: clean(input.launch, 10), website: clean(input.website, 500), details: clean(input.details, 4000), source: clean(input.source, 300) };
  if (!data.name || !/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(data.email) || !SERVICES.has(data.service) || !BUDGETS.has(data.budget) || !data.details || !validUrl(data.website)) return reply(origin, 400, { ok: false, message: 'Please check the form and try again.' });
  const verification = new FormData(); verification.set('secret', env.TURNSTILE_SECRET_KEY); verification.set('response', clean(input.turnstileToken, 2048)); verification.set('remoteip', ip); verification.set('idempotency_key', crypto.randomUUID());
  let challenge;
  try { challenge = await (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: verification, signal: AbortSignal.timeout(8000) })).json(); } catch { return reply(origin, 503, { ok: false, message: 'Security check unavailable. Please try again.' }); }
  if (!challenge.success || !['bykira.co.uk', 'www.bykira.co.uk'].includes(challenge.hostname)) return reply(origin, 400, { ok: false, message: 'Security check failed. Please try again.' });
  const message = [`Name: ${data.name}`, `Email: ${data.email}`, `Business: ${data.business || 'Not provided'}`, `Service: ${data.service}`, `Budget: ${data.budget}`, `Launch: ${data.launch || 'Flexible'}`, `Website: ${data.website || 'Not provided'}`, `Source: ${data.source || 'Not provided'}`, '', 'Project brief:', data.details].join('\n');
  let sent;
  try { sent = await fetch('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(10000), headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }, body: JSON.stringify({ from: env.ENQUIRY_FROM, to: [env.ENQUIRY_TO], reply_to: data.email, subject: `Website enquiry — ${data.service}`, text: message }) }); } catch { sent = null; }
  if (!sent?.ok) { console.error(JSON.stringify({ event: 'enquiry_delivery_failed', status: sent?.status || 0 })); return reply(origin, 503, { ok: false, message: 'The enquiry could not be sent. Please try again.' }); }
  console.log(JSON.stringify({ event: 'enquiry_sent', status: sent.status }));
  return reply(origin, 200, { ok: true });
} };
