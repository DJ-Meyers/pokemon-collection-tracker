import { useState } from "react";
import { createRootRoute, Link, Outlet, type ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageLayout } from "../components/layout";
import { AuthProvider } from "../auth/AuthContext";

function RootErrorComponent({ error }: ErrorComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
      <p className="text-gray-500 mb-6">{error.message}</p>
      <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
        Go Home
      </Link>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootErrorComponent,
});

function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PageLayout>
          <Outlet />
        </PageLayout>
      </AuthProvider>
    </QueryClientProvider>
  );
}
