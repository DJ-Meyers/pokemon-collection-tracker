import { z } from "zod";
import { pokemonSchema, createPokemonSchema, updatePokemonSchema } from "./schemas";

// Placeholder: Types derived from Zod schemas
export type Pokemon = z.infer<typeof pokemonSchema>;
export type CreatePokemon = z.infer<typeof createPokemonSchema>;
export type UpdatePokemon = z.infer<typeof updatePokemonSchema>;
