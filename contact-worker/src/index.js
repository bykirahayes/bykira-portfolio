const ALLOWED_ORIGINS = new Set(['https://bykira.co.uk', 'https://www.bykira.co.uk']);
const SERVICES = new Set(['Landing page', 'Business or portfolio website', 'Custom website', 'Redesign of an existing site', 'Not sure yet']);
const BUDGETS = new Set(['£500–£1,000', '£1,000–£2,500', '£2,500–£5,000', '£5,000+', 'I need guidance']);
const JOURNEY_EVENTS = new Set(['enquiry_viewed', 'enquiry_started', 'enquiry_validation_error', 'enquiry_security_incomplete', 'enquiry_submitted', 'enquiry_submit_failed']);

function reply(origin, status, body) {
  const headers = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'", 'Referrer-Policy': 'no-referrer', Vary: 'Origin', 'X-Content-Type-Options': 'nosniff' };
  return body === null ? new Response(null, { status, headers }) : Response.json(body, { status, headers });
}
function clean(value, max) { const result = typeof value === 'string' ? value.trim() : ''; return result.length <= max ? result : ''; }
function validUrl(value) { if (!value) return true; try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; } }
async function readJsonBody(request, maximumBytes) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > maximumBytes) return { error: 'too_large' };
  if (!request.body) return { error: 'invalid' };
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maximumBytes) {
      await reader.cancel();
      return { error: 'too_large' };
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  try { return { value: JSON.parse(new TextDecoder().decode(body)) }; }
  catch { return { error: 'invalid' }; }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}
function displayDate(value) {
  if (!value) return 'Flexible';
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
function receivedAt() {
  return new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London', timeZoneName: 'short'
  });
}
function textEmail(data, timestamp) {
  return [
    'BY KIRA / NEW PROJECT ENQUIRY',
    '================================',
    `Received: ${timestamp}`,
    '',
    '01 / CONTACT',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Business: ${data.business || 'Not provided'}`,
    '',
    '02 / PROJECT',
    `Service: ${data.service}`,
    `Budget: ${data.budget}`,
    `Ideal launch: ${displayDate(data.launch)}`,
    `Current website: ${data.website || 'Not provided'}`,
    '',
    '03 / THE BRIEF',
    data.details,
    '',
    '04 / DISCOVERY',
    `How they found By Kira: ${data.source || 'Not provided'}`,
    '',
    'Reply directly to this email to contact the prospective client.',
    'Submitted securely at bykira.co.uk/enquiry/'
  ].join('\n');
}
function htmlEmail(data, timestamp) {
  const value = (content) => escapeHtml(content || 'Not provided');
  const website = data.website
    ? `<a href="${escapeHtml(data.website)}" style="color:#ff8d72;text-decoration:underline;word-break:break-all">${escapeHtml(data.website)}</a>`
    : 'Not provided';
  const brief = escapeHtml(data.details).replace(/\r?\n/g, '<br>');
  const replyHref = `mailto:${encodeURIComponent(data.email)}`;

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111111;color:#f4f1ec;font-family:Arial,Helvetica,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">New ${escapeHtml(data.service)} enquiry from ${escapeHtml(data.name)}.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#111111">
    <tr><td align="center" style="padding:28px 12px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:680px;border:1px solid #343434;background:#080808">
        <tr><td style="height:4px;background:#ff6045;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr>
          <td style="padding:30px 34px 26px;border-bottom:1px solid #2d2d2d">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;color:#ffffff">Kira<sup style="font:9px Arial,sans-serif;color:#ff8d72">®</sup></td>
                <td align="right" style="font:11px 'Courier New',monospace;letter-spacing:1.5px;color:#999999">NEW PROJECT / ENQUIRY</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="padding:34px 34px 10px">
          <div style="font:11px 'Courier New',monospace;letter-spacing:1.6px;color:#ff8d72">PROJECT BRIEF / RECEIVED</div>
          <h1 style="margin:12px 0 8px;font:normal 36px/1.1 Georgia,'Times New Roman',serif;color:#ffffff">A new project<br>could begin here.</h1>
          <p style="margin:0;color:#a7a7a7;font-size:13px;line-height:1.6">Submitted ${escapeHtml(timestamp)}</p>
        </td></tr>

        ${emailSection('01', 'Contact', [
          ['Name', value(data.name)],
          ['Email', `<a href="${replyHref}" style="color:#ff8d72;text-decoration:underline">${escapeHtml(data.email)}</a>`],
          ['Business', value(data.business)]
        ])}
        ${emailSection('02', 'Project', [
          ['Service', value(data.service)],
          ['Budget', value(data.budget)],
          ['Ideal launch', escapeHtml(displayDate(data.launch))],
          ['Current website', website]
        ])}

        <tr><td style="padding:24px 34px;border-top:1px solid #2d2d2d">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr><td width="42" valign="top" style="font:12px 'Courier New',monospace;color:#ff8d72">03</td><td style="font:20px Georgia,'Times New Roman',serif;color:#ffffff">The brief</td></tr>
            <tr><td></td><td style="padding-top:15px;color:#d6d2cc;font-size:15px;line-height:1.75">${brief}</td></tr>
          </table>
        </td></tr>

        ${emailSection('04', 'Discovery', [['How they found By Kira', value(data.source)]])}

        <tr><td style="padding:28px 34px 32px;border-top:1px solid #2d2d2d;background:#120b09">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td valign="middle" style="padding-right:18px;color:#aaa4a0;font-size:12px;line-height:1.6">Replying to this email will reply directly to ${escapeHtml(data.name)}.</td>
              <td align="right" valign="middle"><a href="${replyHref}" style="display:inline-block;padding:14px 20px;background:#f4f1ec;color:#090909;font:600 11px Arial,sans-serif;letter-spacing:.8px;text-decoration:none;text-transform:uppercase">Reply to enquiry&nbsp;&nbsp;↗</a></td>
            </tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:18px 24px;color:#777777;font:10px 'Courier New',monospace;letter-spacing:.7px">SENT SECURELY VIA BYKIRA.CO.UK/ENQUIRY/</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
function emailSection(number, heading, rows) {
  const rowHtml = rows.map(([label, value]) => `
    <tr>
      <td width="42" style="padding:8px 0;border-top:1px solid #242424">&nbsp;</td>
      <td width="145" valign="top" style="padding:12px 14px 12px 0;border-top:1px solid #242424;color:#818181;font:10px 'Courier New',monospace;letter-spacing:.8px;text-transform:uppercase">${escapeHtml(label)}</td>
      <td valign="top" style="padding:11px 0;border-top:1px solid #242424;color:#f0ede8;font-size:14px;line-height:1.55">${value}</td>
    </tr>`).join('');
  return `<tr><td style="padding:24px 34px;border-top:1px solid #2d2d2d">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td width="42" valign="top" style="font:12px 'Courier New',monospace;color:#ff8d72">${number}</td><td colspan="2" style="padding-bottom:13px;font:20px Georgia,'Times New Roman',serif;color:#ffffff">${escapeHtml(heading)}</td></tr>
      ${rowHtml}
    </table>
  </td></tr>`;
}
function acknowledgementText(data) {
  return [
    `Hello ${data.name},`, '',
    'Thank you for getting in touch with By Kira. Your project brief has arrived safely.', '',
    `Project type: ${data.service}`,
    `Budget range: ${data.budget}`,
    `Ideal launch: ${displayDate(data.launch)}`, '',
    'I’ll review the details and reply personally within two working days.', '',
    'Kira',
    'Independent website developer · Manchester, England',
    'https://bykira.co.uk/'
  ].join('\n');
}
function acknowledgementHtml(data) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111;color:#f4f1ec;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#111"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;border:1px solid #343434;background:#080808">
<tr><td style="height:4px;background:#ff6045;font-size:0">&nbsp;</td></tr>
<tr><td style="padding:30px 34px;border-bottom:1px solid #2d2d2d;font:700 28px Georgia,serif;color:#fff">Kira<span style="color:#ff8d72">.</span></td></tr>
<tr><td style="padding:42px 34px 18px"><div style="font:11px 'Courier New',monospace;letter-spacing:1.4px;color:#ff8d72">PROJECT BRIEF / RECEIVED</div>
<h1 style="margin:14px 0 20px;font:normal 38px/1.08 Georgia,serif;color:#fff">Thanks, ${escapeHtml(data.name.split(/\s+/)[0])}.<br>Your idea is safely with me.</h1>
<p style="margin:0;color:#b8b3af;font-size:15px;line-height:1.7">I’ll review the details and reply personally within two working days.</p></td></tr>
<tr><td style="padding:22px 34px 30px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">
<tr><td style="padding:12px 0;border-top:1px solid #292929;color:#7f7f7f;font:10px 'Courier New',monospace;text-transform:uppercase">Project type</td><td align="right" style="padding:12px 0;border-top:1px solid #292929;color:#f2efea;font-size:14px">${escapeHtml(data.service)}</td></tr>
<tr><td style="padding:12px 0;border-top:1px solid #292929;color:#7f7f7f;font:10px 'Courier New',monospace;text-transform:uppercase">Budget range</td><td align="right" style="padding:12px 0;border-top:1px solid #292929;color:#f2efea;font-size:14px">${escapeHtml(data.budget)}</td></tr>
<tr><td style="padding:12px 0;border-top:1px solid #292929;color:#7f7f7f;font:10px 'Courier New',monospace;text-transform:uppercase">Ideal launch</td><td align="right" style="padding:12px 0;border-top:1px solid #292929;color:#f2efea;font-size:14px">${escapeHtml(displayDate(data.launch))}</td></tr>
</table></td></tr>
<tr><td style="padding:28px 34px;background:#120b09;color:#aaa4a0;font-size:12px;line-height:1.7">No action is needed. If you want to add anything, simply reply to this email.<br><br><strong style="color:#f4f1ec">Kira</strong><br>Independent website developer · Manchester, England</td></tr>
<tr><td align="center" style="padding:18px;color:#777;font:10px 'Courier New',monospace"><a href="https://bykira.co.uk/" style="color:#ff8d72;text-decoration:none">BYKIRA.CO.UK</a></td></tr>
</table></td></tr></table></body></html>`;
}
async function sendEmail(env, payload) {
  try {
    return await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
      body: JSON.stringify(payload)
    });
  } catch { return null; }
}
function recordJourney(request, event, path, device) {
  console.log(JSON.stringify({
    event: 'enquiry_journey',
    journey_event: event,
    path,
    device,
    country: request.cf?.country || 'unknown'
  }));
}

export default { async fetch(request, env, ctx) {
  const origin = request.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.has(origin)) return reply('', 403, { ok: false, message: 'Request not allowed.' });
  if (request.method === 'OPTIONS') return reply(origin, 204, null);
  const pathname = new URL(request.url).pathname;
  if (request.method !== 'POST' || !['/enquiry', '/event'].includes(pathname)) return reply(origin, 404, { ok: false, message: 'Not found.' });
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return reply(origin, 415, { ok: false, message: 'Invalid request.' });
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (pathname === '/event') {
    if (!(await env.JOURNEY_RATE_LIMITER.limit({ key: ip })).success) return reply(origin, 429, { ok: false, message: 'Too many attempts.' });
    const parsed = await readJsonBody(request, 2048);
    if (parsed.error) return reply(origin, parsed.error === 'too_large' ? 413 : 400, { ok: false, message: 'Invalid request.' });
    const event = clean(parsed.value.event, 50);
    const path = clean(parsed.value.path, 100);
    const device = clean(parsed.value.device, 20);
    if (!JOURNEY_EVENTS.has(event) || path !== '/enquiry/' || !['mobile', 'desktop'].includes(device)) return reply(origin, 400, { ok: false, message: 'Invalid event.' });
    recordJourney(request, event, path, device);
    return reply(origin, 204, null);
  }
  if (!(await env.ENQUIRY_RATE_LIMITER.limit({ key: ip })).success) return reply(origin, 429, { ok: false, message: 'Too many attempts. Please wait and try again.' });
  const parsed = await readJsonBody(request, 16384);
  if (parsed.error) return reply(origin, parsed.error === 'too_large' ? 413 : 400, { ok: false, message: parsed.error === 'too_large' ? 'Request too large.' : 'Invalid request.' });
  const input = parsed.value;
  if (clean(input.companyWebsite, 200)) return reply(origin, 200, { ok: true });
  const data = { name: clean(input.name, 100), email: clean(input.email, 254), business: clean(input.business, 150), service: clean(input.service, 100), budget: clean(input.budget, 100), launch: clean(input.launch, 10), website: clean(input.website, 500), details: clean(input.details, 4000), source: clean(input.source, 300) };
  if (!data.name || !/^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(data.email) || !SERVICES.has(data.service) || !BUDGETS.has(data.budget) || !data.details || !validUrl(data.website)) return reply(origin, 400, { ok: false, message: 'Please check the form and try again.' });
  const verification = new FormData(); verification.set('secret', env.TURNSTILE_SECRET_KEY); verification.set('response', clean(input.turnstileToken, 2048)); verification.set('remoteip', ip); verification.set('idempotency_key', crypto.randomUUID());
  let challenge;
  try { challenge = await (await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: verification, signal: AbortSignal.timeout(8000) })).json(); } catch { return reply(origin, 503, { ok: false, message: 'Security check unavailable. Please try again.' }); }
  if (!challenge.success || !['bykira.co.uk', 'www.bykira.co.uk'].includes(challenge.hostname)) return reply(origin, 400, { ok: false, message: 'Security check failed. Please try again.' });
  const timestamp = receivedAt();
  const message = textEmail(data, timestamp);
  const html = htmlEmail(data, timestamp);
  const sent = await sendEmail(env, { from: env.ENQUIRY_FROM, to: [env.ENQUIRY_TO], reply_to: data.email, subject: `New website enquiry · ${data.service} · ${data.budget}`, text: message, html });
  if (!sent?.ok) { console.error(JSON.stringify({ event: 'enquiry_delivery_failed', status: sent?.status || 0 })); return reply(origin, 503, { ok: false, message: 'The enquiry could not be sent. Please try again.' }); }
  recordJourney(request, 'enquiry_delivered', '/enquiry/', 'server');
  ctx.waitUntil((async () => {
    const acknowledgement = await sendEmail(env, {
      from: env.ENQUIRY_FROM,
      to: [data.email],
      reply_to: env.ENQUIRY_TO,
      subject: 'Your project brief has arrived — By Kira',
      text: acknowledgementText(data),
      html: acknowledgementHtml(data)
    });
    if (!acknowledgement?.ok) console.error(JSON.stringify({ event: 'enquiry_acknowledgement_failed', status: acknowledgement?.status || 0 }));
  })());
  console.log(JSON.stringify({ event: 'enquiry_sent', status: sent.status }));
  return reply(origin, 200, { ok: true });
} };
