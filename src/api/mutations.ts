import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pokemonKeys } from './queryKeys';
import { create, update, remove, loadCollection, getById } from '../store/collection';
import { addChange } from '../store/pendingChanges';
import type { Pokemon, CreatePokemon, UpdatePokemon } from '../data/types';

export function useCreatePokemon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePokemon): Promise<Pokemon> => {
      await loadCollection();
      const pokemon = create(data);
      addChange({ type: 'add', pokemon });
      return pokemon;
    },
    onSettled: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: pokemonKeys.list() }),
        queryClient.invalidateQueries({ queryKey: pokemonKeys.filters() }),
      ]);
    },
  });
}

export function useUpdatePokemon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePokemon }): Promise<Pokemon> => {
      await loadCollection();
      const previous = getById(id);
      const pokemon = update(id, data);
      addChange({ type: 'update', pokemon, previous });
      return pokemon;
    },
    onSettled: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: pokemonKeys.list() }),
        queryClient.invalidateQueries({ queryKey: pokemonKeys.filters() }),
      ]);
    },
  });
}

export function useDeletePokemon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await loadCollection();
      const pokemon = getById(id);
      remove(id);
      if (pokemon) {
        addChange({ type: 'delete', pokemon });
      }
    },
    onSettled: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: pokemonKeys.list() }),
        queryClient.invalidateQueries({ queryKey: pokemonKeys.filters() }),
      ]);
    },
  });
}
