import { useState } from 'react';
import type { Pokemon } from '../../shared/types';
import { createPokemonSchema } from '../../shared/schemas';
import { useCreatePokemon, useUpdatePokemon } from '../api/mutations';
import { NATURES, POKE_BALLS, LANGUAGES, GAMES, GENDERS } from '../lib/constants';

interface PokemonFormProps {
  pokemon?: Pokemon;
  onSuccess?: () => void;
}

interface FormData {
  species: string;
  dex_number: string;
  form: string;
  generation: string;
  nickname: string;
  gender: string;
  level: string;
  nature: string;
  mint_nature: string;
  ability: string;
  is_hidden_ability: boolean;
  ot_name: string;
  ot_tid: string;
  ot_gender: string;
  language_tag: string;
  game_of_origin: string;
  current_location: string;
  is_shiny: boolean;
  is_event: boolean;
  is_alpha: boolean;
  is_gigantamax: boolean;
  poke_ball: string;
  ribbons: string;
  marks: string;
  notes: string;
}

function buildInitialForm(pokemon?: Pokemon): FormData {
  return {
    species: pokemon?.species ?? '',
    dex_number: pokemon?.dex_number?.toString() ?? '',
    form: pokemon?.form ?? '',
    generation: pokemon?.generation?.toString() ?? '',
    nickname: pokemon?.nickname ?? '',
    gender: pokemon?.gender ?? '',
    level: pokemon?.level?.toString() ?? '',
    nature: pokemon?.nature ?? '',
    mint_nature: pokemon?.mint_nature ?? '',
    ability: pokemon?.ability ?? '',
    is_hidden_ability: pokemon?.is_hidden_ability ?? false,
    ot_name: pokemon?.ot_name ?? '',
    ot_tid: pokemon?.ot_tid ?? '',
    ot_gender: pokemon?.ot_gender ?? '',
    language_tag: pokemon?.language_tag ?? '',
    game_of_origin: pokemon?.game_of_origin ?? '',
    current_location: pokemon?.current_location ?? '',
    is_shiny: pokemon?.is_shiny ?? false,
    is_event: pokemon?.is_event ?? false,
    is_alpha: pokemon?.is_alpha ?? false,
    is_gigantamax: pokemon?.is_gigantamax ?? false,
    poke_ball: pokemon?.poke_ball ?? '',
    ribbons: pokemon?.ribbons?.join(', ') ?? '',
    marks: pokemon?.marks?.join(', ') ?? '',
    notes: pokemon?.notes ?? '',
  };
}

function formDataToPayload(form: FormData) {
  return {
    species: form.species,
    dex_number: form.dex_number ? Number(form.dex_number) : 0,
    form: form.form || null,
    generation: form.generation ? Number(form.generation) : 0,
    nickname: form.nickname || null,
    gender: form.gender || null,
    level: form.level ? Number(form.level) : null,
    nature: form.nature || null,
    mint_nature: form.mint_nature || null,
    ability: form.ability || null,
    is_hidden_ability: form.is_hidden_ability,
    ot_name: form.ot_name || null,
    ot_tid: form.ot_tid || null,
    ot_gender: form.ot_gender || null,
    language_tag: form.language_tag || null,
    game_of_origin: form.game_of_origin || null,
    current_location: form.current_location || null,
    is_shiny: form.is_shiny,
    is_event: form.is_event,
    is_alpha: form.is_alpha,
    is_gigantamax: form.is_gigantamax,
    poke_ball: form.poke_ball || null,
    ribbons: form.ribbons ? form.ribbons.split(',').map((s) => s.trim()).filter(Boolean) : [],
    marks: form.marks ? form.marks.split(',').map((s) => s.trim()).filter(Boolean) : [],
    notes: form.notes || null,
  };
}

export function PokemonForm({ pokemon, onSuccess }: PokemonFormProps) {
  const isEdit = !!pokemon;
  const [form, setForm] = useState<FormData>(() => buildInitialForm(pokemon));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreatePokemon();
  const updateMutation = useUpdatePokemon();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload = formDataToPayload(form);
    const result = createPokemonSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString();
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (isEdit && pokemon) {
      updateMutation.mutate(
        { id: pokemon.id, data: result.data },
        { onSuccess },
      );
    } else {
      createMutation.mutate(result.data, { onSuccess });
    }
  }

  const inputClass =
    'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const selectClass = inputClass;
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'mt-1 text-xs text-red-600';
  const sectionClass = 'space-y-4';
  const sectionTitleClass = 'text-lg font-semibold text-gray-800 border-b pb-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Identity */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitleClass}>Identity</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Species <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={inputClass}
              value={form.species}
              onChange={(e) => updateField('species', e.target.value)}
            />
            {errors.species && <p className={errorClass}>{errors.species}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Dex Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className={inputClass}
              value={form.dex_number}
              onChange={(e) => updateField('dex_number', e.target.value)}
            />
            {errors.dex_number && <p className={errorClass}>{errors.dex_number}</p>}
          </div>
          <div>
            <label className={labelClass}>Form</label>
            <input
              type="text"
              className={inputClass}
              value={form.form}
              onChange={(e) => updateField('form', e.target.value)}
            />
            {errors.form && <p className={errorClass}>{errors.form}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Generation <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={9}
              className={inputClass}
              value={form.generation}
              onChange={(e) => updateField('generation', e.target.value)}
            />
            {errors.generation && <p className={errorClass}>{errors.generation}</p>}
          </div>
        </div>
      </fieldset>

      {/* Attributes */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitleClass}>Attributes</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nickname</label>
            <input
              type="text"
              className={inputClass}
              value={form.nickname}
              onChange={(e) => updateField('nickname', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select
              className={selectClass}
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value)}
            >
              <option value="">-- Select --</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Level</label>
            <input
              type="number"
              min={1}
              max={100}
              className={inputClass}
              value={form.level}
              onChange={(e) => updateField('level', e.target.value)}
            />
            {errors.level && <p className={errorClass}>{errors.level}</p>}
          </div>
          <div>
            <label className={labelClass}>Nature</label>
            <select
              className={selectClass}
              value={form.nature}
              onChange={(e) => updateField('nature', e.target.value)}
            >
              <option value="">-- Select --</option>
              {NATURES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Mint Nature</label>
            <select
              className={selectClass}
              value={form.mint_nature}
              onChange={(e) => updateField('mint_nature', e.target.value)}
            >
              <option value="">-- Select --</option>
              {NATURES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Ability</label>
            <input
              type="text"
              className={inputClass}
              value={form.ability}
              onChange={(e) => updateField('ability', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="is_hidden_ability"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={form.is_hidden_ability}
              onChange={(e) => updateField('is_hidden_ability', e.target.checked)}
            />
            <label htmlFor="is_hidden_ability" className="text-sm font-medium text-gray-700">
              Hidden Ability
            </label>
          </div>
        </div>
      </fieldset>

      {/* Origin */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitleClass}>Origin</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>OT Name</label>
            <input
              type="text"
              className={inputClass}
              value={form.ot_name}
              onChange={(e) => updateField('ot_name', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>TID</label>
            <input
              type="text"
              className={inputClass}
              value={form.ot_tid}
              onChange={(e) => updateField('ot_tid', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>OT Gender</label>
            <select
              className={selectClass}
              value={form.ot_gender}
              onChange={(e) => updateField('ot_gender', e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="male">male</option>
              <option value="female">female</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Language</label>
            <select
              className={selectClass}
              value={form.language_tag}
              onChange={(e) => updateField('language_tag', e.target.value)}
            >
              <option value="">-- Select --</option>
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Game of Origin</label>
            <select
              className={selectClass}
              value={form.game_of_origin}
              onChange={(e) => updateField('game_of_origin', e.target.value)}
            >
              <option value="">-- Select --</option>
              {GAMES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Location */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitleClass}>Location</legend>
        <div>
          <label className={labelClass}>Current Location</label>
          <input
            type="text"
            className={inputClass}
            value={form.current_location}
            onChange={(e) => updateField('current_location', e.target.value)}
          />
        </div>
      </fieldset>

      {/* Special Markers */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitleClass}>Special Markers</legend>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_shiny"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={form.is_shiny}
              onChange={(e) => updateField('is_shiny', e.target.checked)}
            />
            <label htmlFor="is_shiny" className="text-sm font-medium text-gray-700">
              Shiny
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_event"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={form.is_event}
              onChange={(e) => updateField('is_event', e.target.checked)}
            />
            <label htmlFor="is_event" className="text-sm font-medium text-gray-700">
              Event
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_alpha"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={form.is_alpha}
              onChange={(e) => updateField('is_alpha', e.target.checked)}
            />
            <label htmlFor="is_alpha" className="text-sm font-medium text-gray-700">
              Alpha
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_gigantamax"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={form.is_gigantamax}
              onChange={(e) => updateField('is_gigantamax', e.target.checked)}
            />
            <label htmlFor="is_gigantamax" className="text-sm font-medium text-gray-700">
              Gigantamax
            </label>
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Poke Ball</label>
            <select
              className={selectClass}
              value={form.poke_ball}
              onChange={(e) => updateField('poke_ball', e.target.value)}
            >
              <option value="">-- Select --</option>
              {POKE_BALLS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Ribbons/Marks */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitleClass}>Ribbons & Marks</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ribbons (comma-separated)</label>
            <input
              type="text"
              className={inputClass}
              value={form.ribbons}
              onChange={(e) => updateField('ribbons', e.target.value)}
              placeholder="e.g. Champion, Tower Master"
            />
          </div>
          <div>
            <label className={labelClass}>Marks (comma-separated)</label>
            <input
              type="text"
              className={inputClass}
              value={form.marks}
              onChange={(e) => updateField('marks', e.target.value)}
              placeholder="e.g. Lunchtime Mark, Sleepy Mark"
            />
          </div>
        </div>
      </fieldset>

      {/* Notes */}
      <fieldset className={sectionClass}>
        <legend className={sectionTitleClass}>Notes</legend>
        <div>
          <textarea
            className={inputClass + ' min-h-[80px]'}
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
          />
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? (isEdit ? 'Updating...' : 'Creating...')
            : (isEdit ? 'Update Pokemon' : 'Add Pokemon')}
        </button>
        {(createMutation.isError || updateMutation.isError) && (
          <p className="text-sm text-red-600">
            {(createMutation.error ?? updateMutation.error)?.message ?? 'An error occurred'}
          </p>
        )}
      </div>
    </form>
  );
}
