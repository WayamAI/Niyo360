import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { AppIcon } from "@/components/icons";
import { Button } from "@/components/shared/Button";
import { BrandLockup } from "@/components/shared/Logo";

/**
 * Sign-in.
 *
 * Deliberately plain: a logo, one card, two fields. The only decoration is the
 * mark itself. Authentication states are explicit — invalid input is reported
 * inline against the field that caused it, never as a raw error string.
 */
export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    // Demo auth: any well-formed email plus any non-empty password is accepted.
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-page px-4 py-10">
      <div className="w-full max-w-[360px]">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* The lockup carries the product name, so there is no separate
              wordmark heading here — that would print PARIVART twice. */}
          <h1>
            <BrandLockup height={84} />
          </h1>
          <p className="type-body-md text-fg-tertiary">Change Intelligence</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-3.5 rounded-lg border border-stroke-default bg-container p-5"
        >
          <div>
            <h2 className="type-heading-md text-fg-primary">Sign in</h2>
            <p className="type-body-sm mt-0.5 text-fg-tertiary">
              Demo build — any email address and password will sign you in.
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
          Demo environment. No real credentials are required or stored.
        </p>
      </div>
    </main>
  );
}
