import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import niyo360Logo from "@/assets/niyo360-logo.svg";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    // Demo auth: any well-formed email + any non-empty password is accepted.
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-page px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={niyo360Logo} alt="Niyo360" className="h-24 w-auto mb-4" />
          <h1 className="type-display-page-sm text-fg-primary">Niyo360</h1>
          <p className="text-sm text-fg-tertiary mt-1">Change Intelligence</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-stroke-default bg-raised p-6 shadow-sm space-y-4"
        >
          <div>
            <h2 className="text-md font-semibold text-fg-primary">Sign in</h2>
            <p className="text-xs text-fg-tertiary mt-1">
              Demo build — any email address and password will sign you in.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            Sign in
          </Button>

          <p className="text-2xs text-fg-tertiary text-center pt-1">
            This is a demo environment. No real credentials are required or stored.
          </p>
        </form>
      </div>
    </div>
  );
}
