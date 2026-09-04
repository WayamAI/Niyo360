import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-fg-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-fg-primary">Page not found</h2>
        <p className="mt-2 text-sm text-fg-tertiary">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-brand/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-fg-primary">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-fg-tertiary">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-brand/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-stroke-default bg-page px-4 py-2 text-sm font-medium text-fg-primary transition-colors hover:bg-action-tertiary-hover"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Niyo360 Change Intelligence — Regulatory Feed & Impact Delta Reports" },
      {
        name: "description",
        content:
          "Niyo360 Change Intelligence by Wayam AI: monitors global regulatory authority feeds, maps new guidelines to the active product-market portfolio, and generates structured Impact Delta Reports for RA specialist review.",
      },
      { name: "author", content: "Wayam AI" },
      { property: "og:title", content: "Niyo360 Change Intelligence — Regulatory Feed & Impact Delta Reports" },
      {
        property: "og:description",
        content:
          "Pharmaceutical regulatory change intelligence: live feed monitoring across FDA, EMA, MHRA, CDSCO, TGA, ANVISA, automated Impact Delta Reports, and the Regulatory Intelligence Agent.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/favicon.svg" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:image", content: "/favicon.svg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
