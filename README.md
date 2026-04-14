# Pokemon Collection Tracker

A static site for tracking your Pokemon collection. Runs on GitHub Pages and uses the GitHub API to save changes back to your repo.

## Setup

### 1. Fork the repository

### 2. Enable GitHub Actions

Go to the **Actions** tab on your fork and enable workflows.

### 3. Enable GitHub Pages

1. Go to **Settings > Pages**
2. Under **Source**, select **GitHub Actions**

Then run the deploy workflow from the **Actions** tab (or push a commit to `main`).

### 4. Create a GitHub Personal Access Token

1. Go to [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new)
2. Under **Repository access**, select **Only select repositories** and pick your fork
3. Under **Permissions > Repository permissions**, set **Contents** to **Read and write**
4. Generate the token and copy it

### 5. Log in

Go to `https://<your-username>.github.io/<repo-name>/` and enter your token.

## How it works

- Collection data lives in `public/data/collection.json` in your repo
- The app loads this file on page load
- Saving commits the updated JSON back to your repo via the GitHub API
- The app detects the repo owner and name from the `.github.io` hostname
- Only users with push access to the repo can save changes

## Local development

```bash
pnpm install
pnpm dev
```

Runs at `http://localhost:5173`. Local dev treats any authenticated user as the owner.
