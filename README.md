# ByKira Portfolio

Production source for [bykira.co.uk](https://bykira.co.uk), built with Vite and deployed to Cloudflare Workers.

## Commands

- `npm run dev` — start the local Vite server
- `npm run build` — create the production build
- `npm run preview` — preview the built site locally
- `npm run deploy:cloudflare` — build and deploy with Wrangler

## Structure

- `src/` — shared JavaScript and styles
- `public/` — static assets copied into the production build
- page folders such as `about/`, `work/`, `services/`, and `enquiry/` — route entry points
- `server/` — Cloudflare Worker entry
- `contact-worker/` — enquiry/contact handling worker

Production deploys are handled by GitHub Actions on pushes to `main`.
