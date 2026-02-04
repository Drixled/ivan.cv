# Ivan.cv

Personal portfolio site for product designer Ivan Uruchurtu. Built with Astro, Tailwind CSS v4, and MDX project case studies. Static output, served via Nginx in Docker, deployed to a VPS.

## Stack
- Astro 5
- Tailwind CSS v4 (CSS-first `@theme` tokens)
- MDX content collections
- Preact + `@preact/signals` (design inspector UI)
- Bun runtime and package manager
- medium-zoom for project image zoom
- `@astrojs/sitemap`, `@astrojs/preact`, `@astrojs/mdx`

## Features
- Bento-style homepage grid with manual project ordering and a "coming soon" state
- MDX project pages with auto-generated Table of Contents (h2) and image zoom
- Design inspector overlay for inspectable elements plus a styles panel with localStorage persistence
- Staggered fade-in transitions and Astro view transitions
- SEO: Open Graph/Twitter tags, JSON-LD for Person/CreativeWork, sitemap filtering

## Design tokens
Defined in `src/styles/global.css` under `@theme`:
- Background: `#0c0c0c`
- Card: `#141414`
- Card Hover: `#1b1b1b`
- Border: `rgba(255, 255, 255, 0.03)`
- Text Primary: `#a6aba4`
- Text Secondary: `#6b7468`
- Fonts: `Hanken Grotesk` (sans), `Fraunces` (display)

## Local development
```bash
bun install
bun run dev
```

## Build and preview
```bash
bun run build
bun run preview
```

## Content: projects
Project pages live in `src/content/projects/*.mdx` and use the `projects` collection.

Frontmatter fields:
- title
- description
- thumbnail (image)
- company
- period
- role
- responsibilities (optional)
- context (optional)
- myJob (optional)
- status: `coming-soon` | `published` (optional)
- order (number)

Images are imported via `astro:assets` and rendered with `<Image />` for optimization.

## Add a project
1. Create `src/content/projects/<slug>.mdx` with the frontmatter above.
2. Add assets under `src/assets/projects/<slug>/` and import them in the MDX.
3. Update manual ordering in `src/pages/index.astro` (see the `projectMap` section).

## Key directories
- `src/pages/` routes (`/`, `/about`, `/playground`, `/styleguide`, `/project/[...slug]`)
- `src/layouts/` shared page shells (`BaseLayout.astro`, `ProjectLayout.astro`)
- `src/components/` UI components (Hero, Nav, Footer, ProjectCardNew)
- `src/components/inspector/` and `src/lib/inspector/` inspector UI and state
- `src/scripts/` view transitions, inspector, and image zoom scripts
- `src/styles/` global styles and tokens
- `public/` static assets (favicons, OG image, CV PDF)

## Deployment
- `astro.config.mjs` sets `site` and outputs static files.
- `Dockerfile` builds with Bun and serves `/dist` using Nginx.

## Notes
- The sitemap excludes `/playground`, `/styleguide`, and selected project pages.
- `BaseLayout.astro` loads fonts, analytics, and the inspector scripts by default.
