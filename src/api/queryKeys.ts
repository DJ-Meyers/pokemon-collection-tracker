export const queryKeys = {
  pokemon: {
    all: ["pokemon"] as const,
    list: () => [...queryKeys.pokemon.all, "list"] as const,
    detail: (id: number) => [...queryKeys.pokemon.all, "detail", id] as const,
  },
} as const;
