import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './client';
import { pokemonKeys } from './queryKeys';
import type { Pokemon, CreatePokemon, UpdatePokemon } from '../../shared/types';

export function useCreatePokemon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePokemon) =>
      apiFetch<Pokemon>('/pokemon', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pokemonKeys.lists() });
    },
  });
}

export function useUpdatePokemon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePokemon }) =>
      apiFetch<Pokemon>(`/pokemon/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: pokemonKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: pokemonKeys.lists() });
    },
  });
}

export function useDeletePokemon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<void>(`/pokemon/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pokemonKeys.lists() });
    },
  });
}
