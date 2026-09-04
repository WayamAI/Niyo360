/**
 * Standalone SSR error shell. This document is served before the app bundle
 * (and its stylesheet) exists, so it cannot use Tailwind utilities or the
 * app's token layer. It therefore inlines literal values copied from the
 * Tier-1 reference palette in src/styles.css — keep the two in sync.
 */
export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* mirrors --ref-* / semantic tokens from src/styles.css (dark-first) */
      :root {
        color-scheme: dark light;
        --page: #000000;
        --raised: #18181b;
        --fg-primary: #fafafa;
        --fg-tertiary: #a1a1aa;
        --stroke-default: #27272a;
        --action-primary: #f4f4f5;
        --on-action-primary: #101012;
      }
      @media (prefers-color-scheme: light) {
        :root {
          --page: #fafafa;
          --raised: #ffffff;
          --fg-primary: #101012;
          --fg-tertiary: #62626b;
          --stroke-default: #e4e4e7;
          --action-primary: #18181b;
          --on-action-primary: #ffffff;
        }
      }
      body {
        font: 13px/1.55 'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif;
        background: var(--page); color: var(--fg-primary);
        display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem;
      }
      .card {
        max-width: 28rem; width: 100%; text-align: center; padding: 2rem;
        background: var(--raised); border: 1px solid var(--stroke-default); border-radius: 16px;
      }
      h1 { font-size: 17px; font-weight: 600; letter-spacing: -0.01em; margin: 0 0 0.5rem; }
      p { color: var(--fg-tertiary); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button {
        padding: 0.5rem 1rem; border-radius: 6px; font: inherit; font-weight: 500;
        cursor: pointer; text-decoration: none; border: 1px solid transparent;
        transition: background-color 180ms ease, border-color 180ms ease;
      }
      .primary { background: var(--action-primary); color: var(--on-action-primary); }
      .secondary { background: transparent; color: var(--fg-primary); border-color: var(--stroke-default); }
      .secondary:hover { border-color: var(--fg-tertiary); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
