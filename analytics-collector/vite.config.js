import { resolve } from 'node:path';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { sites } from '@openai/sites-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sites(), {
    name: 'analytics-worker',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'server/index.js', source: readFileSync(resolve(import.meta.dirname, 'server/worker.js'), 'utf8') });
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
  build: { sourcemap: false },
});
