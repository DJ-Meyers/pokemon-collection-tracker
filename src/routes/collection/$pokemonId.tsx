import { useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { usePokemon } from '../../api/queries';
import { useDeletePokemon } from '../../api/mutations';
import { PokemonForm } from '../../components/PokemonForm';

export const Route = createFileRoute('/collection/$pokemonId')({
  component: PokemonDetailPage,
});

function PokemonDetailPage() {
  const { pokemonId } = Route.useParams();
  const navigate = useNavigate();
  const { data: pokemon, isLoading, isError } = usePokemon(Number(pokemonId));
  const deleteMutation = useDeletePokemon();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (isError || !pokemon) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Pokemon Not Found</h2>
        <p className="text-gray-500 mb-6">
          The Pokemon you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/collection"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Collection
        </Link>
      </div>
    );
  }

  function handleDelete() {
    if (!pokemon) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${pokemon.nickname ?? pokemon.species}?`,
    );
    if (!confirmed) return;
    deleteMutation.mutate(pokemon.id, {
      onSuccess: () => {
        navigate({ to: '/collection' });
      },
    });
  }

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Edit {pokemon.nickname ?? pokemon.species}
          </h1>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
        <PokemonForm
          pokemon={pokemon}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/collection"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Collection
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {pokemon.nickname ? (
            <>
              {pokemon.nickname}{' '}
              <span className="text-lg font-normal text-gray-500">
                ({pokemon.species})
              </span>
            </>
          ) : (
            pokemon.species
          )}
          {pokemon.is_shiny && (
            <span className="ml-2 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
              Shiny
            </span>
          )}
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {deleteMutation.isError && (
        <p className="mb-4 text-sm text-red-600">
          Failed to delete: {deleteMutation.error?.message ?? 'Unknown error'}
        </p>
      )}

      <div className="space-y-6">
        <DetailSection title="Identity">
          <DetailGrid>
            <DetailField label="Species" value={pokemon.species} />
            <DetailField label="Dex #" value={pokemon.dex_number} />
            <DetailField label="Form" value={pokemon.form} />
            <DetailField label="Generation" value={pokemon.generation} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Attributes">
          <DetailGrid>
            <DetailField label="Nickname" value={pokemon.nickname} />
            <DetailField label="Gender" value={pokemon.gender} />
            <DetailField label="Level" value={pokemon.level} />
            <DetailField label="Nature" value={pokemon.nature} />
            <DetailField label="Mint Nature" value={pokemon.mint_nature} />
            <DetailField
              label="Ability"
              value={
                pokemon.ability
                  ? pokemon.is_hidden_ability
                    ? `${pokemon.ability} (HA)`
                    : pokemon.ability
                  : null
              }
            />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Origin">
          <DetailGrid>
            <DetailField label="OT Name" value={pokemon.ot_name} />
            <DetailField label="TID" value={pokemon.ot_tid} />
            <DetailField label="OT Gender" value={pokemon.ot_gender} />
            <DetailField label="Language" value={pokemon.language_tag} />
            <DetailField label="Game of Origin" value={pokemon.game_of_origin} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Location">
          <DetailGrid>
            <DetailField label="Current Location" value={pokemon.current_location} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Special Markers">
          <DetailGrid>
            <DetailField label="Shiny" value={pokemon.is_shiny ? 'Yes' : 'No'} />
            <DetailField label="Event" value={pokemon.is_event ? 'Yes' : 'No'} />
            <DetailField label="Alpha" value={pokemon.is_alpha ? 'Yes' : 'No'} />
            <DetailField label="Gigantamax" value={pokemon.is_gigantamax ? 'Yes' : 'No'} />
            <DetailField label="Ball" value={pokemon.poke_ball} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Ribbons & Marks">
          <DetailGrid>
            <DetailField
              label="Ribbons"
              value={
                pokemon.ribbons && pokemon.ribbons.length > 0
                  ? pokemon.ribbons.join(', ')
                  : null
              }
            />
            <DetailField
              label="Marks"
              value={
                pokemon.marks && pokemon.marks.length > 0
                  ? pokemon.marks.join(', ')
                  : null
              }
            />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Notes">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {pokemon.notes ?? <span className="text-gray-400">None</span>}
          </p>
        </DetailSection>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-gray-900">
        {value != null && value !== '' ? String(value) : (
          <span className="text-gray-400">--</span>
        )}
      </dd>
    </div>
  );
}
