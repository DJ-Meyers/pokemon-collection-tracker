import { useState, useSyncExternalStore } from "react";
import type { Pokemon } from "../data/types";
import { hasChanges, subscribe } from "../store/pendingChanges";
import {
  useBulkUpdatePokemon,
  useBulkDeletePokemon,
  useBulkAddTag,
  useBulkRemoveTag,
} from "../api/mutations";

interface BulkActionBarProps {
  selectedIds: Set<string>;
  allVisibleIds: string[];
  pokemon: Pokemon[];
  onSelectionChange: (ids: Set<string>) => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedIds,
  allVisibleIds,
  pokemon,
  onSelectionChange,
  onClearSelection,
}: BulkActionBarProps) {
  const showSaveBar = useSyncExternalStore(subscribe, hasChanges);
  const [tagInput, setTagInput] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);
  const [showRemoveTag, setShowRemoveTag] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const bulkUpdate = useBulkUpdatePokemon();
  const bulkDelete = useBulkDeletePokemon();
  const bulkAddTag = useBulkAddTag();
  const bulkRemoveTag = useBulkRemoveTag();

  const ids = [...selectedIds];
  const count = selectedIds.size;

  // Collect all tags present on selected Pokemon
  const selectedPokemon = pokemon.filter((p) => selectedIds.has(p.id));
  const tagsOnSelected = [...new Set(selectedPokemon.flatMap((p) => p.tags ?? []))].sort();

  const handleMarkForTrade = () => {
    bulkUpdate.mutate({ ids, data: { is_available_for_trade: true } });
  };

  const handleUnmarkForTrade = () => {
    bulkUpdate.mutate({ ids, data: { is_available_for_trade: false } });
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    bulkAddTag.mutate({ ids, tag }, {
      onSuccess: () => {
        setTagInput("");
        setShowAddTag(false);
      },
    });
  };

  const handleRemoveTag = (tag: string) => {
    bulkRemoveTag.mutate({ ids, tag }, {
      onSuccess: () => {
        setShowRemoveTag(false);
      },
    });
  };

  const handleDelete = () => {
    bulkDelete.mutate(ids, {
      onSuccess: () => {
        onClearSelection();
        setShowDeleteConfirm(false);
      },
    });
  };

  const selectAll = () => {
    onSelectionChange(new Set(allVisibleIds));
  };

  const buttonClass =
    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-lg whitespace-nowrap"
      style={{ bottom: showSaveBar ? 72 : 16 }}
    >
      {/* Selection info */}
      <div className="flex items-center gap-2 text-sm text-gray-600 border-r border-gray-200 pr-2">
        <span className="font-medium whitespace-nowrap">{count} selected</span>
        {count < allVisibleIds.length && (
          <button onClick={selectAll} className="text-blue-600 hover:text-blue-800 text-xs">
            Select all ({allVisibleIds.length})
          </button>
        )}
        <button onClick={onClearSelection} className="text-gray-500 hover:text-gray-700 text-xs">
          Deselect
        </button>
      </div>

      {/* Trade actions */}
      <button
        onClick={handleMarkForTrade}
        className={`${buttonClass} bg-green-50 text-green-700 hover:bg-green-100`}
      >
        Mark for Trade
      </button>
      <button
        onClick={handleUnmarkForTrade}
        className={`${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
      >
        Unmark for Trade
      </button>

      {/* Add tag */}
      <div className="relative">
        <button
          onClick={() => { setShowAddTag(!showAddTag); setShowRemoveTag(false); }}
          className={`${buttonClass} bg-blue-50 text-blue-700 hover:bg-blue-100`}
        >
          Add Tag
        </button>
        {showAddTag && (
          <div className="absolute bottom-full mb-2 left-0 rounded-lg border border-gray-200 bg-white p-3 shadow-lg min-w-[200px]">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddTag(); }}
                placeholder="Tag name"
                className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="rounded-md bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Remove tag */}
      <div className="relative">
        <button
          onClick={() => { setShowRemoveTag(!showRemoveTag); setShowAddTag(false); }}
          disabled={tagsOnSelected.length === 0}
          className={`${buttonClass} bg-orange-50 text-orange-700 hover:bg-orange-100 disabled:opacity-50`}
        >
          Remove Tag
        </button>
        {showRemoveTag && tagsOnSelected.length > 0 && (
          <div className="absolute bottom-full mb-2 left-0 rounded-lg border border-gray-200 bg-white p-3 shadow-lg min-w-[160px]">
            <p className="text-xs text-gray-500 mb-2">Remove tag from selected:</p>
            <div className="flex flex-wrap gap-1">
              {tagsOnSelected.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleRemoveTag(tag)}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200"
                >
                  {tag} &times;
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="relative border-l border-gray-200 pl-3">
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600">Delete {count}?</span>
            <button
              onClick={handleDelete}
              className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
            >
              Confirm
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className={`${buttonClass} bg-gray-100 text-gray-700 hover:bg-gray-200`}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className={`${buttonClass} bg-red-50 text-red-700 hover:bg-red-100`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
