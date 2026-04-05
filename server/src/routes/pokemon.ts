import { Hono } from "hono";

const pokemonRoutes = new Hono();

// Placeholder: CRUD route handlers will be implemented here

pokemonRoutes.get("/", (c) => {
  return c.json([]);
});

export default pokemonRoutes;
