import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getDb } from "./db.js";
import pokemonRoutes from "./routes/pokemon.js";

const app = new Hono();

// Initialize database on startup
getDb();

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

// Mount routes
app.route("/api/pokemon", pokemonRoutes);

const port = 3000;
console.log(`Server running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
