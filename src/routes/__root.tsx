import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Pokemon Collection Tracker
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
