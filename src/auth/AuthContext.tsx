import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getUser, getRepoPermissions, getFileContent } from "../api/github";
import { setBaselineSha } from "../store/collection";

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

// PAT is stored in localStorage for session persistence on a static host.
// Any XSS in this app would exfiltrate the token + grant repo-write.
// Mitigation: CSP meta tag in index.html + never render user-controlled HTML.
const TOKEN_KEY = "github_pat";

const hasStoredToken = !!localStorage.getItem(TOKEN_KEY);
let authSnapshot = { user: null as { login: string; avatar_url: string } | null, isOwner: false, isLoading: hasStoredToken };

export function getAuthSnapshot() {
  return authSnapshot;
}

function detectRepo(): RepoInfo | null {
  // 1. Build-time env override (CNAME / custom domain deploys)
  const envOwner = import.meta.env.VITE_REPO_OWNER;
  const envName = import.meta.env.VITE_REPO_NAME;
  if (envOwner && envName) {
    return { owner: envOwner, name: envName };
  }

  // 2. GitHub Pages subpath: <username>.github.io/<repo>/
  const { hostname, pathname } = window.location;
  const ghPagesMatch = hostname.match(/^(.+)\.github\.io$/);
  if (ghPagesMatch) {
    const owner = ghPagesMatch[1];
    const repoName = pathname.split("/").filter(Boolean)[0];
    if (repoName) return { owner, name: repoName };
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
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const [error, setError] = useState<string | null>(null);

  const validateToken = useCallback(
    async (t: string) => {
      setError(null);
      try {
        const githubUser = await getUser(t);
        setUser(githubUser);

        if (repo) {
          const perms = await getRepoPermissions(t, repo.owner, repo.name);
          setIsOwner(perms.push);

          if (perms.push) {
            try {
              const fileData = await getFileContent(t, repo.owner, repo.name, "public/data/collection.json");
              setBaselineSha(fileData.sha);
            } catch {
              // 404 (file doesn't exist yet) or network error — skip baseline capture
            }
          }
        } else if (import.meta.env.DEV) {
          setIsOwner(true);
        } else {
          setIsOwner(false);
          setError(
            "Could not detect the GitHub repository for this deployment. Set VITE_REPO_OWNER and VITE_REPO_NAME at build time to enable editing.",
          );
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
    setBaselineSha(null);
  }, []);

  useEffect(() => {
    authSnapshot = { user, isOwner, isLoading };
  }, [user, isOwner, isLoading]);

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
