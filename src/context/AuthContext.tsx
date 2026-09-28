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
 * This replaces the demo session that accepted any email and password. There
 * is no local fallback: if the backend rejects the credentials or cannot be
 * reached, sign-in fails and says why. Faking a successful login would mean
 * the rest of the app renders as though it had data it does not have.
 *
 * Three states, so nothing protected renders before the answer is known:
 *
 *   checking        a token exists and is being validated against /auth/me
 *   authenticated   /auth/me returned a user
 *   unauthenticated no token, or the token was rejected
 */
export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

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
        clearSession();
        if (error instanceof ApiError) {
          // 401 here means "wrong credentials", not "session expired" — the
          // generic message from the client would be misleading on this screen.
          const message =
            error.kind === "unauthorized" ? "Incorrect email or password." : error.message;
          return { ok: false, error: message, fieldErrors: error.fieldErrors };
        }
        return { ok: false, error: "Sign-in failed unexpectedly." };
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
