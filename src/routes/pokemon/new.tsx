import { useCallback, useRef } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { PokemonForm, type SubmitMode } from "../../components/PokemonForm";
import { PageHeader } from "../../components/layout";
import { Button } from "../../components/ui/Button";
import { getAuthSnapshot, useAuth } from "../../auth/AuthContext";

export const Route = createFileRoute("/pokemon/new")({
  beforeLoad: () => {
    const snap = getAuthSnapshot();
    if (!snap.isLoading && !(snap.user && snap.isOwner)) {
      throw redirect({ to: "/" });
    }
  },
  component: AddPokemonPage,
});

function AddPokemonPage() {
  const navigate = useNavigate();
  const { user, isOwner } = useAuth();
  const canEdit = !!user && isOwner;
  const submitModeRef = useRef<SubmitMode>("save");
  const handleAddAnother = useCallback(
    (added: { species: string; nickname: string | null }) => {
      const label = added.nickname
        ? `"${added.nickname}" (${added.species})`
        : added.species;
      toast.success(`${label} added to collection`);
    },
    [],
  );

  if (!canEdit) {
    return null;
  }

  return (
    <div>
      <PageHeader>
        <div className="flex items-center justify-between min-h-[38px]">
          <h1 className="text-lg font-bold text-gray-900">Add New Pokemon</h1>
          <div className="flex items-center gap-2">
            <Button type="button" rank="tertiary" onClick={() => navigate({ to: "/" })}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-pokemon-form"
              variant="purple"
              rank="secondary"
              onClick={() => {
                submitModeRef.current = "add-another";
              }}
            >
              Submit &amp; Add Another
            </Button>
            <Button type="submit" form="add-pokemon-form">
              Submit
            </Button>
          </div>
        </div>
      </PageHeader>

      <PokemonForm
        formId="add-pokemon-form"
        onSuccess={() => navigate({ to: "/" })}
        submitModeRef={submitModeRef}
        onAddAnother={handleAddAnother}
      />
    </div>
  );
}
