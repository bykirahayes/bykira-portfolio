import { resolve } from 'node:path';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { sites } from '@openai/sites-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sites(), {
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
        if (request.url === '/about' || request.url === '/about/' || request.url?.startsWith('/about?')) {
          const query = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
          request.url = `/about/index.html${query}`;
        }
        if (request.url === '/privacy' || request.url === '/privacy/' || request.url?.startsWith('/privacy?')) {
          const query = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
          request.url = `/privacy/index.html${query}`;
        }
        if (request.url === '/accessibility' || request.url === '/accessibility/' || request.url?.startsWith('/accessibility?')) {
          const query = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
          request.url = `/accessibility/index.html${query}`;
        }
        if (request.url === '/terms' || request.url === '/terms/' || request.url?.startsWith('/terms?')) {
          const query = request.url.includes('?') ? request.url.slice(request.url.indexOf('?')) : '';
          request.url = `/terms/index.html${query}`;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'server/index.js',
        source: readFileSync(resolve(import.meta.dirname, 'server/worker.js'), 'utf8'),
      });
    },
    closeBundle() {
      const output = resolve(import.meta.dirname, 'dist');
      const client = resolve(output, 'client');
      rmSync(client, { recursive: true, force: true });
      mkdirSync(client, { recursive: true });
      for (const entry of readdirSync(output)) {
        if (entry === 'client' || entry === 'server' || entry === '.openai') continue;
        cpSync(resolve(output, entry), resolve(client, entry), { recursive: true });
      }
    },
  }],
  build: {
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
        privacyPage: resolve(import.meta.dirname, 'privacy/index.html'),
        accessibilityPage: resolve(import.meta.dirname, 'accessibility/index.html'),
        termsPage: resolve(import.meta.dirname, 'terms/index.html'),
        about: resolve(import.meta.dirname, 'about/index.html'),
      },
    },
  },
});
