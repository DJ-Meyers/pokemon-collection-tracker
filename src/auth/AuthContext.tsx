import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getUser, getRepoPermissions } from "../api/github";

interface RepoInfo {
  owner: string;
  name: string;
}

interface AuthState {
  token: string | null;
  user: { login: string; avatar_url: string } | null;
  repo: RepoInfo | null;
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;
  saveToken: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "github_pat";

function detectRepo(): RepoInfo | null {
  const { hostname, pathname } = window.location;

  // GitHub Pages: <username>.github.io/<repo>/
  const ghPagesMatch = hostname.match(/^(.+)\.github\.io$/);
  if (ghPagesMatch) {
    const owner = ghPagesMatch[1];
    const repoName = pathname.split("/").filter(Boolean)[0];
    if (repoName) {
      return { owner, name: repoName };
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [user, setUser] = useState<{ login: string; avatar_url: string } | null>(null);
  const [repo] = useState<RepoInfo | null>(() => detectRepo());
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateToken = useCallback(
    async (t: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const githubUser = await getUser(t);
        setUser(githubUser);

        if (repo) {
          const perms = await getRepoPermissions(t, repo.owner, repo.name);
          setIsOwner(perms.push);
        } else {
          // No repo detected (local dev) — treat as owner if token is valid
          setIsOwner(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Token validation failed");
        setToken(null);
        setUser(null);
        setIsOwner(false);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    },
    [repo],
  );

  // Validate stored token on mount
  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveToken = useCallback(async (pat: string) => {
    localStorage.setItem(TOKEN_KEY, pat);
    setToken(pat);
    await validateToken(pat);
  }, [validateToken]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsOwner(false);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, user, repo, isOwner, isLoading, error, saveToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
