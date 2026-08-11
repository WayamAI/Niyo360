# RegIQ UI (remix-of-ui-design-assistant)

Small setup guide to run this project locally.

## Prerequisites

- Node.js 20+ (recommended: 20 or 22)
- npm 10+

Check versions:

```bash
node -v
npm -v
```

## 1. Install dependencies

From project root:

```bash
cd /home/balaji-s/j2w/remix-of-ui-design-assistant
npm install
```

## 2. Run in development mode

```bash
npm run dev
```

Then open the local URL shown in terminal (usually http://localhost:5173).

## 3. Build for production

```bash
npm run build
```

Build output is generated in the dist folder.

## 4. Preview production build locally

```bash
npm run preview
```

## Useful scripts

- Start dev server: `npm run dev`
- Build app: `npm run build`
- Build (dev mode): `npm run build:dev`
- Vercel build helper: `npm run vercel-build`
- Lint: `npm run lint`
- Format: `npm run format`

## Optional: deploy on Vercel

If using Vercel, this repo already has a vercel build script:

```bash
npm run vercel-build
```

## Troubleshooting

- If port is busy, stop old process and run `npm run dev` again.
- If dependency issues occur, remove node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

- If TypeScript or lint issues appear, run:

```bash
npm run lint
```

## Notes

This project uses Vite + React + TypeScript with TanStack Start style structure.
