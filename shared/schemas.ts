import { z } from "zod";

// Placeholder: Pokemon schemas will be defined here
export const pokemonSchema = z.object({
  id: z.number(),
  name: z.string(),
  pokedexNumber: z.number(),
  type: z.string(),
  collected: z.boolean(),
});

export const createPokemonSchema = pokemonSchema.omit({ id: true });
export const updatePokemonSchema = createPokemonSchema.partial();
