import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  ApiError,
  authApi,
  getAccessToken,
  isApiConfigured,
  setAccessToken,
  setUnauthorizedHandler,
  type User,
} from "@/services/api";

/**
 * Authentication against the PARIVART backend.
 *
 * There is no local fallback: if the backend cannot be reached, sign-in fails
 * and says why. Faking a successful login would mean the rest of the app
 * renders as though it had data it does not have.
 *
 * One deliberate exception, for demonstrations. With
 * VITE_DEMO_OPEN_SIGNIN=true, an email the backend does not know is treated as
 * a new tenant rather than a mistake: the same submission registers an
 * organization and signs into it. The token is a real one from a real
 * endpoint, so nothing downstream is faked — but that organization is empty,
 * so every operational screen will honestly show no rows. Seeded accounts keep
 * working and keep their data. Off by default.
 *
 * Three states, so nothing protected renders before the answer is known:
 *
 *   checking        a token exists and is being validated against /auth/me
 *   authenticated   /auth/me returned a user
 *   unauthenticated no token, or the token was rejected
 */
export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

/** Whether an unknown email registers itself instead of being rejected. */
export const isOpenSignIn = import.meta.env.VITE_DEMO_OPEN_SIGNIN === "true";

export interface LoginResult {
  ok: boolean;
  /** Present when ok is false — safe to show the user. */
  error?: string;
  /** Per-field messages from a 422, keyed by field name. */
  fieldErrors?: Record<string, string>;
}

interface AuthContextType {
  status: AuthStatus;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Turns a failed sign-in into something the screen can show.
 *
 * Two cases need more than the client's generic sentence. A 401 on this screen
 * means "wrong credentials", not "session expired". And a 422 — which is how
 * the backend's eight-character password minimum arrives — says only that
 * values were rejected, so the field messages are spelled out rather than
 * swallowed; the sign-in form has no per-field slots to show them in.
 */
function describeFailure(error: unknown): { error: string; fieldErrors?: Record<string, string> } {
  if (!(error instanceof ApiError)) return { error: "Sign-in failed unexpectedly." };
  if (error.kind === "unauthorized") return { error: "Incorrect email or password." };

  const fieldErrors = error.fieldErrors;
  const messages = Object.values(fieldErrors);
  if (error.kind === "validation" && messages.length > 0) {
    return { error: messages.join(" "), fieldErrors };
  }
  return { error: error.message, fieldErrors };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [user, setUser] = useState<User | null>(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // One place reacts to a 401 from any request: drop the session. The router
  // then renders sign-in, so there is no redirect to loop on.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Restore a session on load by validating the stored token. A token that is
  // present but expired must not count as signed in, so this asks the server
  // rather than trusting the token's existence.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!isApiConfigured || !getAccessToken()) {
        if (!cancelled) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await authApi.me();
        if (cancelled) return;
        setUser(me);
        setStatus("authenticated");
      } catch {
        // Covers an expired token (401, already cleared by the client) and a
        // backend that is down — either way there is no usable session.
        if (!cancelled) clearSession();
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      try {
        const token = await authApi.login(email.trim(), password);
        setUser(token.user);
        setStatus("authenticated");
        return { ok: true };
      } catch (error) {
        // An unknown email, when open sign-in is on: register it and continue.
        // Only a 401 qualifies — a timeout or a 500 must not be answered by
        // creating an account.
        if (isOpenSignIn && error instanceof ApiError && error.kind === "unauthorized") {
          try {
            const token = await authApi.registerFromEmail(email, password);
            setUser(token.user);
            setStatus("authenticated");
            return { ok: true };
          } catch (registerError) {
            clearSession();
            return { ok: false, ...describeFailure(registerError) };
          }
        }
        clearSession();
        return { ok: false, ...describeFailure(error) };
      }
    },
    [clearSession],
  );

  const logout = useCallback(() => {
    // The backend issues a stateless token and exposes no /logout, so signing
    // out is a client-side discard.
    authApi.logout();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        isAuthenticated: status === "authenticated",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
