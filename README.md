# Personal Website

Static personal site built with [Astro](https://astro.build). Editorial-first design, sharp corners, two-color accent palette, zero JS by default.

This commit covers **Pass 1, Step 1** of the design spec: scaffolding, design tokens, base layout, nav, footer, and the home page (hero + about + education + experience).

## Develop

Requires Node 18.17+ or 20+.

```bash
npm install
npm run dev      # local dev server on http://localhost:4321
npm run build    # static build into ./dist
npm run preview  # serve the production build locally
```

`pnpm` and `yarn` work as well — swap the command prefix.

## Update site-wide chrome

| What                 | Where                                     |
| -------------------- | ----------------------------------------- |
| Site URL             | `astro.config.mjs` (`site:`)              |
| Wordmark in nav      | `src/components/Nav.astro` (`[YOUR NAME]`)|
| Email                | `src/components/Footer.astro` (`EMAIL`)   |
| Phone (or remove)    | `src/components/Footer.astro` (`PHONE_*`) |
| Location             | `src/components/Footer.astro` (`LOCATION`)|
| Social URLs          | `src/components/Footer.astro` (`SOCIALS`) |
| Default OG image     | `public/og-default.svg`                   |
| Favicon              | `public/favicon.svg`                      |

> The "Contact" nav link routes to the `#contact` anchor inside the footer rather than to a dedicated page. The footer **is** the contact surface — no form, no backend, just a `mailto:` link as the primary CTA.

## Design tokens

All colors, type sizes, spacing, and layout widths are CSS custom properties defined in:

```
src/styles/tokens.css
```

Edit values there to change them across the whole site. The token system follows §3 of the design spec. **Do not hardcode color, spacing, or font values inside components.**

Order of CSS imports (set in `BaseLayout.astro`):

```
tokens.css → reset.css → typography.css → global.css
```

## Add content (Pass 1, Step 2)

Content collections are not wired up in Step 1. Step 2 will introduce:

```
src/content/
  config.ts           ← Zod schemas
  projects/*.md       ← drop project markdown here
  blog/*.md           ← drop blog post markdown here
```

Each entry will use frontmatter: `title`, `date`, `summary`, `image`, `github`, `tags`.

## Step 3 (later)

- RSS feed (`src/pages/rss.xml.js`) via `@astrojs/rss`
- Sitemap is already wired through `@astrojs/sitemap` in `astro.config.mjs`
- Replace `public/og-default.svg` with a real 1200×630 PNG
- Optional sticky nav on desktop after first-pass review
- KaTeX + syntax highlighting in articles (TODO comments are in place)

## Deploy

The build outputs static files to `dist/`. Deploys cleanly to Netlify, Vercel, Cloudflare Pages, or any static host — no extra config required. Update `site:` in `astro.config.mjs` before deploying so sitemap and canonical URLs resolve correctly.
