const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; connect-src 'self' https://cloudflareinsights.com; form-action 'self' mailto:; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self'; upgrade-insecure-requests",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
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
  if (pathname === '/terms' || pathname === '/terms/') return '/terms/index.html';
  return pathname;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'bykira-portfolio.safe-bream-3817.chatgpt.site'
      && (request.method === 'GET' || request.method === 'HEAD')) {
      url.protocol = 'https:';
      url.hostname = 'bykira.co.uk';
      url.port = '';
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname === '/faq.html') { url.pathname = '/faq'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/services.html') { url.pathname = '/services/'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/enquiry.html') { url.pathname = '/enquiry/'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/privacy.html') { url.pathname = '/privacy/'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/accessibility.html') { url.pathname = '/accessibility/'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/terms.html') { url.pathname = '/terms/'; return Response.redirect(url.toString(), 301); }
    url.pathname = staticPath(url.pathname);
    const response = await env.ASSETS.fetch(new Request(url, request));
    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(securityHeaders)) secured.headers.set(name, value);
    return secured;
  },
};
