# Ivan.cv Portfolio Site

## Stack
- **Framework**: Astro
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Content**: MDX for project pages
- **Runtime**: Bun
- **Deployment**: VPS via Dokploy (Vercel for iteration)

## Design Tokens
```
Background:       #000000
Card background:  #0D0D0D
Text primary:     #A6ABA4
Text secondary:   #6B7468
```

## Commands
```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run preview  # Preview production build
```

## File Structure
```
src/
├── components/
│   ├── Nav.astro
│   ├── ProjectCard.astro
│   └── Footer.astro
├── content/
│   └── projects/           # MDX files
│       └── project-name.mdx
├── layouts/
│   ├── BaseLayout.astro    # View Transitions, meta
│   └── ProjectLayout.astro # Project page wrapper
├── pages/
│   ├── index.astro         # Homepage
│   ├── about.astro         # About me
│   ├── playground.astro    # Under construction
│   └── project/
│       └── [...slug].astro # Dynamic project routes
└── styles/
    └── global.css          # Tailwind + custom tokens
```

## Site Structure
- `/` → Homepage (nav, intro, project cards)
- `/about` → About me page
- `/playground` → Playground (under construction)
- `/project/[slug]` → Project detail pages (MDX)

## Content Collections Schema
Projects have:
- title
- description
- thumbnail
- company
- period
- role
- order (for sorting)

## Coding Rules

When fixing CSS/styling issues, always test the change in multiple browsers (Chrome, Safari, Firefox) before committing, especially for animations and transitions.

For UI bug fixes, prefer minimal targeted changes over removing entire systems. If a fix breaks something else, pause and explain the tradeoff before proceeding.
