const GITHUB_API = "https://api.github.com";

// ---- Types ----

interface GitHubUser {
  login: string;
  avatar_url: string;
}

interface RepoPermissions {
  push: boolean;
}

interface FileContent {
  sha: string;
  content: string;
}

interface CommitResponse {
  content: { sha: string };
  commit: { sha: string; message: string };
}

// ---- Helpers ----

function apiHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

// ---- GitHub API ----

export async function getUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${GITHUB_API}/user`, { headers: apiHeaders(token) });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return { login: data.login, avatar_url: data.avatar_url };
}

export async function getRepoPermissions(
  token: string,
  owner: string,
  repo: string,
): Promise<RepoPermissions> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: apiHeaders(token),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return { push: data.permissions?.push ?? false };
}

export async function getFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
): Promise<FileContent> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers: apiHeaders(token) },
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return { sha: data.sha, content: data.content };
}

export async function commitFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  sha: string,
  message: string,
): Promise<CommitResponse> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: apiHeaders(token),
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha,
      }),
    },
  );
  if (res.status === 409) {
    throw new Error(
      "CONFLICT: The file was modified externally. Please reload and try again.",
    );
  }
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}
