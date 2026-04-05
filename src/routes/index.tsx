import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Pokemon Collection Tracker
      </h1>
      <p className="mt-2 text-gray-600">
        Track and manage your Pokemon collection.
      </p>
    </div>
  );
}
