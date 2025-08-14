# XGE — Project Explorer

> Interactive map experience showcasing climate and sustainability initiatives

XGE Project Explorer turns static climate information into an engaging, explorable map so people can quickly discover projects, understand impact, and take action.

## Tech Highlights

![Svelte](https://img.shields.io/badge/-Svelte-FF3E00?style=flat&logo=svelte&logoColor=white)
![SvelteKit](https://img.shields.io/badge/-SvelteKit-000000?style=flat&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind%20CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white)
![Mapbox](https://img.shields.io/badge/-Mapbox-000000?style=flat&logo=mapbox&logoColor=white)
![pnpm](https://img.shields.io/badge/-pnpm-F69220?style=flat&logo=pnpm&logoColor=white)
![ESLint](https://img.shields.io/badge/-ESLint-4B32C3?style=flat&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/-Prettier-F7B93E?style=flat&logo=prettier&logoColor=black)
![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat&logo=vercel&logoColor=white)

## Stakeholder Overview

- **Organizations**: Showcase impact with verified, geolocated projects.
- **Funders**: Identify opportunities across categories and regions.
- **Researchers/Policymakers**: Visualize distribution patterns and gaps.
- **Public/Advocates**: Discover nearby initiatives and get involved.

## Core Features

- **Interactive map** with smooth pan/zoom powered by Mapbox GL JS
- **Custom SVG markers** with category icons and accessible keyboard support
- **Real‑time filtering** by region and impact category
- **Responsive UI** optimized for desktop and mobile
- **Stability and performance** targets: map load ≤ 3s, filter updates ≤ 500ms

## Stack and Architecture

- **Framework**: Svelte 5 with SvelteKit, built with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Mapping**: Mapbox GL JS (v3)
- **State**: Svelte stores for map, projects, filters, and selection
- **Quality**: ESLint + Prettier + svelte-check
- **Deploy**: Vercel with environment-based configuration

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── MapContainer.svelte       # Map init, controls, loading/error states
│   │   └── ProjectMarkers.svelte     # Custom marker rendering & interactions
│   ├── data/
│   │   └── projects.ts               # Static Canadian project examples
│   ├── stores/
│   │   ├── map.ts
│   │   ├── projects.ts
│   │   ├── selectedProject.ts
│   │   └── filters.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── env.ts
│       ├── errors.ts
│       ├── helpers.ts
│       └── validation.ts
└── routes/
    ├── +layout.svelte
    └── +page.svelte
```

## Data Model

```ts
interface Project {
  id: string;
  title: string;
  description: string;
  impactCategory: 'renewable-energy' | 'conservation' | 'sustainable-agriculture' | 'waste-management';
  region: 'north-america';
  coordinates: [number, number];
  url?: string;
  verified?: boolean;
  source?: string;
  dateVerified?: string; // ISO YYYY-MM-DD
}
```

## Get Started (Local)

### Prerequisites

- Node.js 18+
- pnpm (recommended)
- Mapbox account and access token

### Install

```bash
git clone https://github.com/your-org/xge.git
cd xge
pnpm install
```

### Configure environment

Create a `.env` file in the project root with your Mapbox token:

```bash
PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

Notes:
- Only variables prefixed with `PUBLIC_` are exposed to the browser by SvelteKit.
- The app reads this at build/runtime from `$env/static/public`.

### Run

```bash
pnpm dev           # start dev server
pnpm dev -- --open # start and open browser
```

Open `http://localhost:5173`.

### Build & Preview

```bash
pnpm build   # production build
pnpm preview # preview the build locally
```

### Quality checks

```bash
pnpm check         # svelte-check type analysis
pnpm check:watch   # watch mode
pnpm lint          # eslint + prettier check
pnpm format        # auto-format
pnpm prepare       # SvelteKit sync (runs automatically as needed)
```

## Troubleshooting

- Map not loading: ensure `PUBLIC_MAPBOX_ACCESS_TOKEN` is valid and present in `.env`.
- Empty map/markers: confirm sample data in `src/lib/data/projects.ts` and filters are cleared.

## License

All rights reserved. © 2025 Ryan Roga. See `LICENSE` for full terms. Use, copying, modification, distribution, or derivative works are prohibited without prior written permission from the copyright holder.

## Acknowledgments

- Mapbox for mapping technology
- The Svelte and SvelteKit teams
- Climate organizations whose work inspires this project

— Built with care for climate action

© 2025 Ryan Roga. All rights reserved.
