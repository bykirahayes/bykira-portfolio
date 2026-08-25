import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [{
    name: 'clean-faq-url',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/faq' || request.url?.startsWith('/faq?')) {
          request.url = `/faq.html${request.url.slice(4)}`;
        }
        if (request.url === '/services' || request.url === '/services/' || request.url?.startsWith('/services?')) {
          const query = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
          request.url = `/services/index.html${query}`;
        }
        if (request.url === '/enquiry' || request.url === '/enquiry/' || request.url?.startsWith('/enquiry?')) {
          const query = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
          request.url = `/enquiry/index.html${query}`;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'server/index.js',
        source: `const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/faq.html') {
      url.pathname = '/faq';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/faq') url.pathname = '/faq.html';
    if (url.pathname === '/services.html') {
      url.pathname = '/services/';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/services' || url.pathname === '/services/') url.pathname = '/services/index.html';
    if (url.pathname === '/enquiry.html') {
      url.pathname = '/enquiry/';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/enquiry' || url.pathname === '/enquiry/') url.pathname = '/enquiry/index.html';
    const response = await env.ASSETS.fetch(new Request(url, request));
    const secured = new Response(response.body, response);
    for (const [name, value] of Object.entries(securityHeaders)) secured.headers.set(name, value);
    return secured;
  },
};
`,
      });
    },
  }],
  build: {
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        faq: resolve(import.meta.dirname, 'faq.html'),
        notFound: resolve(import.meta.dirname, '404.html'),
        serverError: resolve(import.meta.dirname, '500.html'),
        services: resolve(import.meta.dirname, 'services/index.html'),
        work: resolve(import.meta.dirname, 'work/index.html'),
        enquiry: resolve(import.meta.dirname, 'enquiry/index.html'),
        enquiryRedirect: resolve(import.meta.dirname, 'enquiry.html'),
        privacy: resolve(import.meta.dirname, 'privacy.html'),
        accessibility: resolve(import.meta.dirname, 'accessibility.html'),
      },
    },
  },
});
