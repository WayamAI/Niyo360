import { useState, type FormEvent } from "react";
import { isOpenSignIn, useAuth } from "@/context/AuthContext";
import { AppIcon } from "@/components/icons";
import { Button } from "@/components/shared/Button";
import { BrandLockup } from "@/components/shared/Logo";

/**
 * Sign-in.
 *
 * Split-screen: a visual panel and the form. The visual panel is CSS-only
 * (gradient + node motif on brand tokens) rather than a stretched image —
 * nothing in the repo's icon assets is shaped or licensed for a full-bleed
 * hero crop. Authentication states are explicit — invalid input is reported
 * inline against the field that caused it, never as a raw error string.
 */
export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return; // guards a double submit creating two requests
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error ?? "Sign-in failed.");
      setSubmitting(false);
    }
    // On success the auth state flips and the route swaps to the app shell,
    // so this component unmounts — no need to clear `submitting`.
  }

  return (
    <main className="flex min-h-screen w-full bg-page">
      <LoginVisualPanel />

      <div className="flex min-h-screen w-full flex-1 items-center justify-center px-4 py-10 lg:w-auto lg:flex-none lg:basis-[480px] lg:px-10">
        <div className="w-full max-w-[360px]">
          <div className="mb-8 lg:hidden">
            <h1>
              <BrandLockup height={64} />
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <h2 className="type-heading-lg text-fg-primary">Welcome back</h2>
              <p className="type-body-sm mt-0.5 text-fg-tertiary">
                Sign in with your PARIVART account.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="type-label-sm block text-fg-quaternary">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                required
                className="type-body-lg h-9 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary placeholder:text-fg-quaternary transition-colors duration-150 hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="type-label-sm block text-fg-quaternary">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
                required
                className="type-body-lg h-9 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary placeholder:text-fg-quaternary transition-colors duration-150 hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                className="type-body-md flex items-start gap-1.5 rounded-md border border-error-stroke bg-error-bg px-2.5 py-2 text-error"
              >
                <AppIcon name="error" size="sm" className="mt-0.5 shrink-0 text-error-icon" />
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="type-caption mt-4 text-center text-fg-quaternary">
            {isOpenSignIn
              ? "Credentials are verified by the PARIVART API. An email it does not know starts a new organization, which has no data in it yet."
              : "Credentials are verified by the PARIVART API."}
          </p>
        </div>
      </div>
    </main>
  );
}

/**
 * Left-side visual panel, desktop only. Pure CSS — a brand-orange gradient
 * field with a faint node/connector motif standing in for "interconnected
 * regulatory signals," built from the same tokens as the rest of the app
 * rather than an imported image.
 */
function LoginVisualPanel() {
  return (
    <div
      className="relative hidden overflow-hidden lg:block lg:flex-1"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, var(--brand) 0%, transparent 55%), " +
          "radial-gradient(circle at 80% 75%, var(--data-accent) 0%, transparent 50%), " +
          "#1a1410",
      }}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-30"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <g fill="none" stroke="var(--color-on-brand-surface)" strokeWidth="1">
          <line x1="80" y1="120" x2="320" y2="260" />
          <line x1="320" y1="260" x2="620" y2="180" />
          <line x1="320" y1="260" x2="260" y2="520" />
          <line x1="260" y1="520" x2="540" y2="620" />
          <line x1="540" y1="620" x2="700" y2="420" />
          <line x1="620" y1="180" x2="700" y2="420" />
        </g>
        <g fill="var(--color-on-brand-surface)">
          <circle cx="80" cy="120" r="5" />
          <circle cx="320" cy="260" r="7" />
          <circle cx="620" cy="180" r="5" />
          <circle cx="260" cy="520" r="6" />
          <circle cx="540" cy="620" r="5" />
          <circle cx="700" cy="420" r="6" />
        </g>
      </svg>

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <span className="type-heading-md text-2xl tracking-tight text-white">PARIVART</span>

        <div className="max-w-md">
          <h2 className="type-heading-lg text-2xl text-white">Regulatory change, understood.</h2>
          <p className="type-body-lg mt-3 text-white/80">
            PARIVART tracks regulatory sources, maps obligations to your products and markets, and
            surfaces the impact of every change before it reaches you unannounced.
          </p>
        </div>
      </div>
    </div>
  );
}
