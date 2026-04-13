import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./ui/Button";

export function SetupGuide({ onClose }: { onClose: () => void }) {
  const { saveToken, isLoading, error, user } = useAuth();
  const [pat, setPat] = useState("");

  // Auto-close on successful login
  useEffect(() => {
    if (user) onClose();
  }, [user, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pat.trim()) {
      saveToken(pat.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Connect to GitHub
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              &times;
            </button>
          </div>

          <div className="text-sm text-gray-600 mb-4 space-y-2">
            <p>
              <a
                href="https://github.com/settings/personal-access-tokens/new?name=Pokemon+Collection+Tracker&expires_in=90&contents=write"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Create a fine-grained Personal Access Token
              </a>
              {" "}(name and permissions are pre-filled) with these settings:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Set an expiration (default 90 days), or choose no expiration if you prefer (<a href="https://github.blog/changelog/2021-07-26-expiration-options-for-personal-access-tokens/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">understand the trade-offs</a>)</li>
              <li>
                Under <strong>Repository access</strong>, choose <strong>Only select repositories</strong> and pick your collection repo
                <img src="./setup-repo-access.png" alt="Repository access settings showing Only select repositories selected" className="mt-2 rounded border border-gray-200" />
              </li>
              <li>Under <strong>Permissions</strong>, confirm that only <strong>Contents</strong> (Read and write) and <strong>Metadata</strong> (Read-only) are added</li>
            </ol>
            <p>Then paste the token below.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="github_pat_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
              disabled={isLoading}
            />
            <div className="flex gap-3 justify-end">
              <Button type="button" rank="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!pat.trim() || isLoading}>
                {isLoading ? "Validating..." : "Connect"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
