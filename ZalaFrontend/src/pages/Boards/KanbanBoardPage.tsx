import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useFetch } from "../../hooks";
import { useAuthStore } from "../../stores";
import type {
  BoardStepCard,
  KanbanBoard,
  LeadCard,
  PropertyCard,
} from "../../interfaces";
import { Plus, Trash2, Check, X, ChevronLeft, ChevronRight } from "lucide-react";

type LeadComposerState = {
  business: string;
  person_type: string;
  website: string;
  license_num: string;
  notes: string;
};

type PropertyComposerState = {
  property_name: string;
  notes: string;
  mls_number: string;
  address: {
    street_1: string;
    street_2: string;
    city: string;
    state: string;
    zipcode: string;
  };
};

type AddressResponse = PropertyComposerState["address"] & {
  address_id: number;
};

const createDefaultLeadForm = (): LeadComposerState => ({
  business: "",
  person_type: "",
  website: "",
  license_num: "",
  notes: "",
});

const createDefaultPropertyForm = (): PropertyComposerState => ({
  property_name: "",
  notes: "",
  mls_number: "",
  address: {
    street_1: "",
    street_2: "",
    city: "",
    state: "",
    zipcode: "",
  },
});



const TextArea = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) => (
  <textarea
    className="w-full px-3 py-2 rounded border border-slate-300 text-sm focus:outline-none focus:border-blue-500 resize-none"
    rows={3}
    value={value}
    placeholder={placeholder}
    onChange={(ev) => onChange(ev.target.value)}
  />
);

export const KanbanBoardPage = () => {
  const { get, post, put, del } = useFetch();
  const { enqueueSnackbar } = useSnackbar();
  const currentUser = useAuthStore((state) => state.user);
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadBoards = async (preferredId?: number | null) => {
    setLoading(true);
    setError(null);
    const { data, err } = await get<KanbanBoard[]>(`/api/boards?limit=50`);
    if (err || !data) {
      setBoards([]);
      setError(err ?? "Unable to fetch boards");
      setActiveBoardId(null);
      setLoading(false);
      return;
    }

    setBoards(data);

    if (data.length === 0) {
      setActiveBoardId(null);
    } else {
      const fallback =
        preferredId && data.some((b) => b.board_id === preferredId)
          ? preferredId
          : activeBoardId && data.some((b) => b.board_id === activeBoardId)
          ? activeBoardId
          : data[0].board_id;
      setActiveBoardId(fallback);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeBoard = useMemo(() => {
    if (!activeBoardId) return null;
    return boards.find((board) => board.board_id === activeBoardId) ?? null;
  }, [boards, activeBoardId]);

  const findStep = (stepId: number): BoardStepCard | undefined => {
    return boards
      .flatMap((board) => board.board_steps)
      .find((step) => step.board_step_id === stepId);
  };

  const withBusy = async (
    label: string,
    fn: () => Promise<void>,
    preferredBoard?: number | null
  ) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
      await loadBoards(preferredBoard);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error occurred"
      );
    } finally {
      setBusy(null);
    }
  };

  const handleCreateBoard = async (name: string, steps?: string[]) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      enqueueSnackbar("Board name is required", { variant: "warning" });
      return;
    }
    await withBusy("Creating board...", async () => {
      const payload: { board_name: string; user_id?: number } = {
        board_name: trimmedName,
        user_id: currentUser?.userId,
      };
      const { data, err } = await post<KanbanBoard>(`/api/boards`, payload);
      if (err || !data) {
        throw new Error(err ?? "Unable to create board");
      }

      // Use provided template step names (max 5) or fall back to defaults
      const defaults = ["To Do", "In Progress", "Review", "Done", "Backlog"];
      const sampleSteps = (steps &&
        steps
          .slice(0, 5)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)) || defaults;

      for (let i = 0; i < sampleSteps.length; i++) {
        await post(`/api/board-steps`, {
          board_id: data.board_id,
          board_column: i + 1,
          step_name: sampleSteps[i],
        });
      }

      await loadBoards(data.board_id);
    });
  };

  const handleUpdateBoard = async (
    boardId: number,
    updates: { board_name?: string; user_id?: number | null }
  ) => {
    const payload = { ...updates };
    if (typeof payload.board_name === "string") {
      payload.board_name = payload.board_name.trim();
    }
    await withBusy("Updating board...", async () => {
      const { err } = await put<KanbanBoard>(`/api/boards/${boardId}`, payload);
      if (err) throw new Error(err);
    }, boardId);
  };

  const handleDeleteBoard = async (boardId: number) => {
    await withBusy("Deleting board...", async () => {
      const { err } = await del(`/api/boards/${boardId}`);
      if (err) throw new Error(err);
    }, boardId === activeBoardId ? null : activeBoardId);
  };

  const handleCreateStep = async (boardId: number, stepName: string) => {
    const trimmedName = stepName.trim();
    if (!trimmedName) {
      enqueueSnackbar("Column name is required", { variant: "warning" });
      return;
    }
    const board = boards.find((b) => b.board_id === boardId);
    const nextColumn =
      board && board.board_steps.length > 0
        ? Math.max(...board.board_steps.map((s) => s.board_column)) + 1
        : 1;

    await withBusy("Creating step...", async () => {
      const { err } = await post(`/api/board-steps`, {
        board_id: boardId,
        board_column: nextColumn,
        step_name: trimmedName,
      });
      if (err) throw new Error(err);
    }, boardId);
  };

  const handleDeleteStep = async (boardId: number, stepId: number) => {
    await withBusy("Deleting step...", async () => {
      const { err } = await del(`/api/board-steps/${stepId}`);
      if (err) throw new Error(err);
    }, boardId);
  };

  const handleCreateLead = async (
    stepId: number,
    form: LeadComposerState
  ) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find target step for lead");
      return;
    }
    if (step.properties.length > 0) {
      enqueueSnackbar(
        `This column is reserved for properties. Move the properties out before adding leads.`,
        { variant: "warning" }
      );
      return;
    }
    const title = form.business.trim();
    if (!title) {
      enqueueSnackbar("Lead name is required", { variant: "warning" });
      return;
    }

    await withBusy("Creating lead...", async () => {
      const payload: LeadComposerState = {
        business: title,
        person_type: form.person_type?.trim() ?? "",
        website: form.website?.trim() ?? "",
        license_num: form.license_num?.trim() ?? "",
        notes: form.notes?.trim() ?? "",
      };
      const { data, err } = await post<LeadCard>(`/api/leads`, payload);
      if (err || !data) throw new Error(err ?? "Unable to create lead");

      const newLeadIds = [...(step.leads ?? []).map((lead) => lead.lead_id)];
      newLeadIds.push(data.lead_id);

      const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
        lead_ids: newLeadIds,
      });
      if (stepErr) throw new Error(stepErr);
    }, step.board_id);
  };

  const handleUpdateLead = async (leadId: number, updates: LeadComposerState) => {
    const payload: LeadComposerState = {
      business: updates.business?.trim() || "Untitled Lead",
      person_type: updates.person_type?.trim() ?? "",
      website: updates.website?.trim() ?? "",
      license_num: updates.license_num?.trim() ?? "",
      notes: updates.notes?.trim() ?? "",
    };
    await withBusy("Updating lead...", async () => {
      const { err } = await put(`/api/leads/${leadId}`, payload);
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleDeleteLead = async (leadId: number, stepId: number) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find step for lead removal");
      return;
    }

    await withBusy("Deleting lead...", async () => {
      const remainingIds = step.leads
        .filter((lead) => lead.lead_id !== leadId)
        .map((lead) => lead.lead_id);

      const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
        lead_ids: remainingIds,
      });
      if (stepErr) throw new Error(stepErr);

      const { err } = await del(`/api/leads/${leadId}`);
      if (err) throw new Error(err);
    }, step.board_id);
  };

  const handleMoveLead = async (
    leadId: number,
    fromStepId: number,
    toStepId: number
  ) => {
    if (fromStepId === toStepId) return;
    const fromStep = findStep(fromStepId);
    const toStep = findStep(toStepId);
    if (!fromStep || !toStep) {
      setError("Unable to move lead between steps");
      return;
    }

    // Check if target step has only properties (no leads ever added to it)
    if (toStep.leads.length === 0 && toStep.properties.length > 0) {
      setWarning(
        `Cannot move lead to "${toStep.step_name}" - this step only contains properties`
      );
      setTimeout(() => setWarning(null), 5000);
      return;
    }

    await withBusy("Moving lead...", async () => {
      const remainingIds = fromStep.leads
        .filter((lead) => lead.lead_id !== leadId)
        .map((lead) => lead.lead_id);
      const destIds = Array.from(
        new Set([...toStep.leads.map((lead) => lead.lead_id), leadId])
      );

      const { err: fromErr } = await put(`/api/board-steps/${fromStepId}`, {
        lead_ids: remainingIds,
      });
      if (fromErr) throw new Error(fromErr);

      const { err: toErr } = await put(`/api/board-steps/${toStepId}`, {
        lead_ids: destIds,
      });
      if (toErr) throw new Error(toErr);
    }, fromStep.board_id);
  };

  const handleCreateProperty = async (
    stepId: number,
    form: PropertyComposerState
  ) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find target step for property");
      return;
    }
    if (step.leads.length > 0) {
      enqueueSnackbar(
        `This column currently holds lead cards. Move them before adding properties.`,
        { variant: "warning" }
      );
      return;
    }
    const trimmedName = form.property_name.trim();
    if (!trimmedName) {
      enqueueSnackbar("Property name is required", { variant: "warning" });
      return;
    }
    const street = form.address.street_1.trim();
    const city = form.address.city.trim();
    const state = form.address.state.trim();
    const zip = form.address.zipcode.trim();
    if (!street || !city || !state || !zip) {
      enqueueSnackbar(
        "Street, city, state, and zip are required for a property address",
        { variant: "warning" }
      );
      return;
    }

    await withBusy("Creating property...", async () => {
      const { data: address, err: addressErr } = await post<AddressResponse>(
        `/api/addresses`,
        {
          street_1: street,
          street_2: form.address.street_2.trim(),
          city,
          state,
          zipcode: zip,
        }
      );
      if (addressErr || !address)
        throw new Error(addressErr ?? "Unable to create address");

      const { data: property, err: propertyErr } = await post<PropertyCard>(
        `/api/addresses/${address.address_id}/properties`,
        {
          property_name: trimmedName,
          notes: form.notes?.trim() ?? "",
          mls_number: form.mls_number?.trim() ?? "",
        }
      );

      if (propertyErr || !property)
        throw new Error(propertyErr ?? "Unable to create property");

      const propertyIds = [
        ...(step.properties ?? []).map((prop) => prop.property_id),
        property.property_id,
      ];

      const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
        property_ids: propertyIds,
      });
      if (stepErr) throw new Error(stepErr);
    }, step.board_id);
  };

  const handleUpdateProperty = async (
    property: PropertyCard,
    updates: { property_name?: string; notes?: string; mls_number?: string }
  ) => {
    if (!property.address_id) {
      enqueueSnackbar("Cannot update property without an address", {
        variant: "warning",
      });
      return;
    }

    const payload = { ...updates };
    if (payload.property_name !== undefined) {
      payload.property_name = payload.property_name.trim();
    }
    if (payload.notes !== undefined) {
      payload.notes = payload.notes.trim();
    }
    if (payload.mls_number !== undefined) {
      payload.mls_number = payload.mls_number.trim();
    }

    await withBusy("Updating property...", async () => {
      const { err } = await put(
        `/api/addresses/${property.address_id}/properties/${property.property_id}`,
        payload
      );
      if (err) throw new Error(err);
    }, activeBoardId);
  };

  const handleDeleteProperty = async (
    property: PropertyCard,
    stepId: number
  ) => {
    if (!property.address_id) {
      setError("Property missing address_id");
      return;
    }

    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find step for property");
      return;
    }

    await withBusy("Deleting property...", async () => {
      const remainingIds = step.properties
        .filter((prop) => prop.property_id !== property.property_id)
        .map((prop) => prop.property_id);

      const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
        property_ids: remainingIds,
      });
      if (stepErr) throw new Error(stepErr);

      const { err } = await del(
        `/api/addresses/${property.address_id}/properties/${property.property_id}`
      );
      if (err) throw new Error(err);
    }, step.board_id);
  };

  const handleMoveProperty = async (
    propertyId: number,
    fromStepId: number,
    toStepId: number
  ) => {
    if (fromStepId === toStepId) return;
    const fromStep = findStep(fromStepId);
    const toStep = findStep(toStepId);
    if (!fromStep || !toStep) {
      setError("Unable to move property between steps");
      return;
    }

    // Check if target step has only leads (no properties ever added to it)
    if (toStep.properties.length === 0 && toStep.leads.length > 0) {
      setWarning(
        `Cannot move property to "${toStep.step_name}" - this step only contains leads`
      );
      setTimeout(() => setWarning(null), 5000);
      return;
    }

    await withBusy("Moving property...", async () => {
      const remainingIds = fromStep.properties
        .filter((prop) => prop.property_id !== propertyId)
        .map((prop) => prop.property_id);
      const destIds = Array.from(
        new Set([
          ...toStep.properties.map((prop) => prop.property_id),
          propertyId,
        ])
      );

      const { err: fromErr } = await put(`/api/board-steps/${fromStepId}`, {
        property_ids: remainingIds,
      });
      if (fromErr) throw new Error(fromErr);

      const { err: toErr } = await put(`/api/board-steps/${toStepId}`, {
        property_ids: destIds,
      });
      if (toErr) throw new Error(toErr);
    }, fromStep.board_id);
  };

  const handleRenameStep = async (
    boardId: number,
    stepId: number,
    newName: string
  ) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    
    await withBusy("Updating step...", async () => {
      const { err } = await put(`/api/board-steps/${stepId}`, {
        step_name: trimmedName,
      });
      if (err) throw new Error(err);
    }, boardId);
  };

  const BoardList = () => {
    const [name, setName] = useState("");

    const onSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      handleCreateBoard(name);
      setName("");
    };

    return (
      <div className="h-full p-6 flex flex-col space-y-6 bg-primary rounded-xl">
        <div>
          <h2 className="text-2xl font-bold text-secondary">Boards</h2>
          <p className="text-secondary-50 text-sm mt-1">Manage your projects</p>
        </div>

        <div className="space-y-2 overflow-auto pr-2 flex-1">
          {boards.map((board) => {
            const isActive = activeBoardId === board.board_id;
            const ownerId = board.user?.user_id ?? board.user_id ?? null;
            const isMine =
              currentUser?.userId && ownerId
                ? ownerId === currentUser.userId
                : false;
            const ownerLabel = board.user?.username
              ? isMine
                ? "You"
                : board.user.username
              : ownerId
              ? isMine
                ? "You"
                : "Team member"
              : "Unassigned";

            return (
              <div
                key={board.board_id}
                className={clsx(
                  "flex items-center justify-between rounded-lg px-4 py-3 cursor-pointer transition-all duration-200",
                  isActive
                    ? "bg-accent text-white shadow-lg transform scale-105"
                    : "bg-transparent hover:bg-primary/10 text-secondary"
                )}
                onClick={() => setActiveBoardId(board.board_id)}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-semibold truncate">
                    {board.board_name}
                  </span>
                  <span
                    className={clsx(
                      "text-xs",
                      isActive ? "text-white/80" : "text-secondary-50"
                    )}
                  >
                    Owner: {ownerLabel}
                  </span>
                </div>

                <button
                  className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDeleteBoard(board.board_id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
          {boards.length === 0 && (
            <p className="text-sm text-secondary-50 text-center py-8">
              No boards yet. Create your first board below.
            </p>
          )}
        </div>

        <div className="border-t border-secondary-50 pt-4">
          <h3 className="text-lg font-bold text-secondary mb-3">New Board</h3>
          <form
            className="space-y-3"
            onSubmit={onSubmit}
            autoComplete="off"
          >
            <input
              type="text"
              placeholder="Board name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white border border-secondary-50 text-secondary placeholder-secondary-50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-accent hover:bg-accent/90 text-white py-2 text-sm font-semibold transition-colors disabled:opacity-50"
              disabled={!name.trim() || !!busy}
            >
              {busy === "Creating board..." ? "Creating..." : "Create Board"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const BoardHeader = () => {
    if (!activeBoard) return null;

    const ownerId = activeBoard.user?.user_id ?? activeBoard.user_id ?? null;
    const ownedByCurrent =
      currentUser?.userId && ownerId ? ownerId === currentUser.userId : false;
    const ownerName = activeBoard.user?.username
      ? ownedByCurrent
        ? "You"
        : activeBoard.user.username
      : ownerId
      ? ownedByCurrent
        ? "You"
        : "Team member"
      : "Unassigned";

    return (
      <div className="card-base box-shadow p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-secondary mb-2">{activeBoard.board_name}</h1>
            <p className="text-secondary-50">Owner: <span className="font-semibold text-secondary">{ownedByCurrent ? "You" : ownerName}</span></p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-secondary text-sm font-semibold transition-colors border border-secondary-50"
              onClick={() =>
                handleUpdateBoard(activeBoard.board_id, {
                  user_id: currentUser?.userId ?? null,
                })
              }
              disabled={!currentUser || ownedByCurrent}
            >
              {ownedByCurrent ? "Your Board" : "Take Ownership"}
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              onClick={() => handleDeleteBoard(activeBoard.board_id)}
              disabled={!!busy}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StepCreator = () => {
    const [stepName, setStepName] = useState("");

    if (!activeBoard) return null;

    const onSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      handleCreateStep(activeBoard.board_id, stepName);
      setStepName("");
    };

    return (
      <div className="card-base box-shadow p-4">
        <form className="flex flex-wrap gap-3 items-end" onSubmit={onSubmit}>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-secondary mb-2 uppercase">Step name</label>
            <input
              type="text"
              placeholder="e.g., To Do, In Progress, Done"
              value={stepName}
              onChange={(e) => setStepName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-secondary-50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={!stepName || !!busy}
          >
            <Plus size={16} />
            {busy === "Creating step..." ? "Adding..." : "Add Step"}
          </button>
        </form>
      </div>
    );
  };

  const StepColumn = ({ step }: { step: BoardStepCard }) => {
    const [cardType, setCardType] = useState<"lead" | "property">(
      step.leads.length > 0
        ? "lead"
        : step.properties.length > 0
        ? "property"
        : "lead"
    );
    const [composerOpen, setComposerOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(step.step_name);
    const [leadForm, setLeadForm] = useState<LeadComposerState>(
      createDefaultLeadForm()
    );
    const [propertyForm, setPropertyForm] =
      useState<PropertyComposerState>(createDefaultPropertyForm());
    const [dragOverStepId, setDragOverStepId] = useState<number | null>(null);

    useEffect(() => {
      const enforced =
        step.leads.length > 0
          ? "lead"
          : step.properties.length > 0
          ? "property"
          : null;
      if (enforced) setCardType(enforced);
    }, [step.leads.length, step.properties.length]);

    const updateLeadForm = (key: keyof LeadComposerState, value: string) => {
      setLeadForm((prev) => ({ ...prev, [key]: value }));
    };

    const updatePropertyForm = (
      key: keyof PropertyComposerState,
      value: string
    ) => {
      setPropertyForm((prev) => ({ ...prev, [key]: value }));
    };

    const updatePropertyAddress = (
      key: keyof PropertyComposerState["address"],
      value: string
    ) => {
      setPropertyForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    };

    const lockToLead = step.leads.length > 0;
    const lockToProperty = step.properties.length > 0;
    const effectiveCardType = lockToLead
      ? "lead"
      : lockToProperty
      ? "property"
      : cardType;

    const allowedLeadTargets = activeBoard?.board_steps.filter(
      (candidate) =>
        candidate.board_step_id === step.board_step_id ||
        candidate.properties.length === 0
    );

    const allowedPropertyTargets = activeBoard?.board_steps.filter(
      (candidate) =>
        candidate.board_step_id === step.board_step_id ||
        candidate.leads.length === 0
    );

    const cardCount = step.leads.length + step.properties.length;

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverStepId(step.board_step_id);
    };

    const handleDragLeave = () => {
      setDragOverStepId(null);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverStepId(null);
      
      const data = e.dataTransfer.getData("card");
      if (!data) return;

      try {
        const { cardId, fromStepId, cardType: type } = JSON.parse(data);
        if (fromStepId === step.board_step_id) return;

        if (type === "lead") {
          handleMoveLead(cardId, fromStepId, step.board_step_id);
        } else {
          handleMoveProperty(cardId, fromStepId, step.board_step_id);
        }
      } catch (err) {
        console.error("Drop error:", err);
      }
    };

    const handleSaveTitle = async () => {
      if (editedTitle.trim() === step.step_name) {
        setIsEditingTitle(false);
        return;
      }
      await handleRenameStep(step.board_id, step.board_step_id, editedTitle);
      setIsEditingTitle(false);
    };

    return (
      <div 
        className={clsx(
          "card-base box-shadow p-4 space-y-3 min-w-[340px] max-w-[340px] h-fit border-2 flex flex-col transition-all",
          dragOverStepId === step.board_step_id 
            ? "border-accent bg-primary/50" 
            : "border-primary"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header with editable title */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") {
                      setEditedTitle(step.step_name);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded border-2 border-accent text-sm font-bold focus:outline-none text-secondary"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-2 hover:bg-primary rounded transition-colors text-accent"
                  title="Save"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(step.step_name);
                    setIsEditingTitle(false);
                  }}
                  className="p-2 hover:bg-error/20 rounded transition-colors text-error"
                  title="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingTitle(true)}
                className="cursor-pointer group"
              >
                <h3 className="text-lg font-bold text-secondary truncate group-hover:text-accent transition-colors">{step.step_name}</h3>
                <p className="text-xs font-semibold text-secondary-50 mt-1">
                  {cardCount} {cardCount === 1 ? "card" : "cards"}
                </p>
              </div>
            )}
          </div>
          <button
            className="p-2 hover:bg-primary rounded-lg transition-colors text-secondary hover:text-accent"
            onClick={() => handleDeleteStep(step.board_id, step.board_step_id)}
            title="Delete step"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Cards Container */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-2">
          {step.leads.map((lead) => (
            <LeadCardView
              key={lead.lead_id}
              lead={lead}
              stepId={step.board_step_id}
              moveTargets={allowedLeadTargets ?? []}
              busy={!!busy}
              onSave={(updates) => handleUpdateLead(lead.lead_id, updates)}
              onDelete={() => handleDeleteLead(lead.lead_id, step.board_step_id)}
              onMove={(targetStepId) =>
                handleMoveLead(lead.lead_id, step.board_step_id, targetStepId)
              }
            />
          ))}

          {step.properties.map((property) => (
            <PropertyCardView
              key={property.property_id}
              property={property}
              stepId={step.board_step_id}
              moveTargets={allowedPropertyTargets ?? []}
              busy={!!busy}
              onSave={(updates) =>
                handleUpdateProperty(property, updates)
              }
              onDelete={() =>
                handleDeleteProperty(property, step.board_step_id)
              }
              onMove={(targetStepId) =>
                handleMoveProperty(
                  property.property_id,
                  step.board_step_id,
                  targetStepId
                )
              }
            />
          ))}

          {cardCount === 0 && !composerOpen && (
            <div className="flex items-center justify-center py-8 text-secondary-50">
              <p className="text-sm">No cards yet</p>
            </div>
          )}
        </div>

        {/* Add Card Button */}
        <button
          className="w-full rounded-lg border-2 border-dashed border-secondary-50 py-3 text-sm font-semibold text-secondary hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
          onClick={() => setComposerOpen((prev) => !prev)}
        >
          <Plus size={16} />
          {composerOpen ? "Close" : "Add Card"}
        </button>

        {/* Composer */}
        {composerOpen && (
          <div className="space-y-3 border-t border-secondary-50 pt-3 bg-primary rounded-lg p-3">
            {(step.leads.length === 0 || step.properties.length === 0) && (
              <div className="flex flex-row gap-2">
                <button
                  type="button"
                  className={clsx(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-semibold border transition",
                    effectiveCardType === "lead"
                      ? "bg-accent text-white border-accent"
                      : "bg-white border-secondary-50"
                  )}
                  onClick={() => setCardType("lead")}
                  disabled={lockToProperty}
                >
                  Lead
                </button>
                <button
                  type="button"
                  className={clsx(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-semibold border transition",
                    effectiveCardType === "property"
                      ? "bg-accent text-white border-accent"
                      : "bg-white border-secondary-50"
                  )}
                  onClick={() => setCardType("property")}
                  disabled={lockToLead}
                >
                  Property
                </button>
              </div>
            )}
            {lockToLead && (
              <p className="text-xs text-slate-500">
                This column holds lead cards.
              </p>
            )}
            {lockToProperty && (
              <p className="text-xs text-slate-500">
                This column holds property cards.
              </p>
            )}

            {effectiveCardType === "lead" ? (
              <LeadComposerForm
                disabled={!!busy}
                form={leadForm}
                onChange={updateLeadForm}
                onSubmit={() => {
                  handleCreateLead(step.board_step_id, leadForm);
                  setLeadForm(createDefaultLeadForm());
                  setComposerOpen(false);
                }}
              />
            ) : (
              <PropertyComposerForm
                disabled={!!busy}
                form={propertyForm}
                onChange={updatePropertyForm}
                onAddressChange={updatePropertyAddress}
                onSubmit={() => {
                  handleCreateProperty(step.board_step_id, propertyForm);
                  setPropertyForm(createDefaultPropertyForm());
                  setComposerOpen(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-1 bg-background overflow-hidden">
      {/* Sidebar with toggle button */}
      <div className="flex items-stretch relative">
        {/* Sidebar */}
        <div className={clsx(
          "flex-shrink-0 h-full overflow-auto border-r border-primary bg-white transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-80" : "w-0"
        )}>
          <div className="p-4 flex-1">
            <BoardList />
          </div>
        </div>

        {/* Toggle Button - positioned to the right of sidebar, always visible */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          className={clsx(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            "bg-white border border-secondary-50 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-accent",
            "shadow-md absolute",
            sidebarOpen ? "left-80 top-4" : "left-0 top-4"
          )}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Error Message */}
        {error && (
          <div className="bg-error text-white px-6 py-4 text-sm font-medium">
            <p>{error}</p>
          </div>
        )}

        {/* Warning Message */}
        {warning && (
          <div className="bg-yellow-500 text-white px-6 py-4 text-sm font-medium animate-pulse">
            <p>{warning}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
              <p className="text-secondary-50">Loading boards...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !activeBoard && (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-bold text-secondary mb-2">No Board Selected</h2>
              <p className="text-secondary-50">Create a board to get started with your project management.</p>
            </div>
          </div>
        )}

        {/* Board View */}
        {!loading && activeBoard && (
          <>
            {/* Status Message */}
            {busy && (
              <div className="bg-primary border-b border-accent text-secondary px-6 py-3 text-sm font-medium">
                {busy}
              </div>
            )}

            {/* Header */}
            <div className="flex-shrink-0">
              <BoardHeader />
              <div className="px-6 py-4">
                <StepCreator />
              </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-6 p-6 pb-8 h-full min-w-min">
                {activeBoard.board_steps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-secondary-50 flex-1">
                    <div className="text-center max-w-md">
                      <div className="text-4xl mb-4">→</div>
                      <p className="text-secondary-50">Use the "Add Step" button above to create custom columns</p>
                    </div>
                  </div>
                ) : (
                  activeBoard.board_steps
                    .slice()
                    .sort((a, b) => a.board_column - b.board_column)
                    .map((step) => (
                      <StepColumn key={step.board_step_id} step={step} />
                    ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const LeadComposerForm = ({
  form,
  disabled,
  onChange,
  onSubmit,
}: {
  form: LeadComposerState;
  disabled: boolean;
  onChange: (key: keyof LeadComposerState, value: string) => void;
  onSubmit: () => void;
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wide">
        <span className="font-semibold">
          Lead Title <span className="text-red-500">*</span>
        </span>
        <span className="text-slate-400 normal-case">
          Appears on the card
        </span>
      </div>
      <input
        type="text"
        placeholder="Card title (lead or business)"
        value={form.business}
        onChange={(e) => onChange("business", e.target.value)}
        className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
      />
      <input
        type="text"
        placeholder="Category (optional)"
        value={form.person_type}
        onChange={(e) => onChange("person_type", e.target.value)}
        className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Website (optional)"
          value={form.website}
          onChange={(e) => onChange("website", e.target.value)}
          className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
        />
        <input
          type="text"
          placeholder="License # (optional)"
          value={form.license_num}
          onChange={(e) => onChange("license_num", e.target.value)}
          className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
        />
      </div>
      <TextArea
        placeholder="Notes"
        value={form.notes}
        onChange={(value) => onChange("notes", value)}
      />
      <p className="text-xs text-slate-500">
        Fields marked with <span className="text-red-500">*</span> are required.
      </p>
      <button
        type="button"
        className="w-full rounded-lg bg-accent hover:bg-accent/90 text-white py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        onClick={onSubmit}
        disabled={disabled}
      >
        Create Lead
      </button>
    </div>
  );
};

const PropertyComposerForm = ({
  form,
  disabled,
  onChange,
  onAddressChange,
  onSubmit,
}: {
  form: PropertyComposerState;
  disabled: boolean;
  onChange: (key: keyof PropertyComposerState, value: string) => void;
  onAddressChange: (
    key: keyof PropertyComposerState["address"],
    value: string
  ) => void;
  onSubmit: () => void;
}) => {
  const hasAllAddressFields =
    !!form.address.street_1.trim() &&
    !!form.address.city.trim() &&
    !!form.address.state.trim() &&
    !!form.address.zipcode.trim();
  const hasRequiredFields = !!form.property_name.trim() && hasAllAddressFields;

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Property name"
        value={form.property_name}
        onChange={(e) => onChange("property_name", e.target.value)}
        className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
      />
      <input
        type="text"
        placeholder="MLS #"
        value={form.mls_number}
        onChange={(e) => onChange("mls_number", e.target.value)}
        className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
      />
      <TextArea
        placeholder="Notes"
        value={form.notes}
        onChange={(value) => onChange("notes", value)}
      />
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-secondary uppercase">Address</label>
        <div className="grid grid-cols-1 gap-2">
          <input
            type="text"
            placeholder="Street 1"
            value={form.address.street_1}
            onChange={(e) => onAddressChange("street_1", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            placeholder="Street 2"
            value={form.address.street_2}
            onChange={(e) => onAddressChange("street_2", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="City"
              value={form.address.city}
              onChange={(e) => onAddressChange("city", e.target.value)}
              className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="State"
              value={form.address.state}
              onChange={(e) => onAddressChange("state", e.target.value)}
              className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="Zip"
              value={form.address.zipcode}
              onChange={(e) => onAddressChange("zipcode", e.target.value)}
              className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        {hasRequiredFields
          ? "All required details provided."
          : "Provide a name plus street, city, state, and zip before saving."}
      </p>
      <button
        type="button"
        className="w-full rounded-lg bg-accent hover:bg-accent/90 text-white py-2 text-sm font-semibold transition-colors disabled:opacity-50"
        onClick={onSubmit}
        disabled={disabled}
      >
        Create Property
      </button>
    </div>
  );
};

const LeadCardView = ({
  lead,
  stepId,
  moveTargets,
  busy,
  onSave,
  onDelete,
  onMove,
}: {
  lead: LeadCard;
  stepId: number;
  moveTargets: BoardStepCard[];
  busy: boolean;
  onSave: (updates: LeadComposerState) => void;
  onDelete: () => void;
  onMove: (targetStepId: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<LeadComposerState>({
    business: lead.business ?? "",
    person_type: lead.person_type ?? "",
    website: lead.website ?? "",
    license_num: lead.license_num ?? "",
    notes: lead.notes ?? "",
  });

  useEffect(() => {
    setForm({
      business: lead.business ?? "",
      person_type: lead.person_type ?? "",
      website: lead.website ?? "",
      license_num: lead.license_num ?? "",
      notes: lead.notes ?? "",
    });
  }, [lead.lead_id, lead.business, lead.person_type, lead.website, lead.license_num, lead.notes]);

  const onChange = (key: keyof LeadComposerState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "card",
          JSON.stringify({
            cardId: lead.lead_id,
            fromStepId: stepId,
            cardType: "lead",
          })
        );
      }}
      className="bg-white rounded-lg p-4 space-y-2 box-shadow-sm border-l-4 border-accent hover:shadow-lg transition-shadow group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-secondary truncate">{lead.business ?? "Untitled Lead"}</p>
          {lead.contact?.email && (
            <p className="text-xs text-secondary-50 mt-1 truncate">{lead.contact.email}</p>
          )}
          {lead.person_type && (
            <p className="text-xs text-accent font-medium mt-1">{lead.person_type}</p>
          )}
          {lead.website && (
            <a
              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 mt-1 block truncate"
            >
              {lead.website}
            </a>
          )}
          {lead.license_num && (
            <p className="text-xs text-secondary-50 mt-1">License: {lead.license_num}</p>
          )}
        </div>
        <span className="text-xs font-bold text-accent bg-primary px-2 py-1 rounded whitespace-nowrap">
          LEAD
        </span>
      </div>
      {lead.notes && (
        <p className="text-xs text-secondary whitespace-pre-wrap line-clamp-3">
          {lead.notes}
        </p>
      )}
      <div className="flex flex-wrap gap-1 text-xs pt-2 border-t border-secondary-50">
        <button
          className="px-2 py-1 rounded bg-primary text-accent hover:bg-primary/80 transition-colors"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "Close" : "Edit"}
        </button>
        <button
          className="px-2 py-1 rounded bg-error/20 text-error hover:bg-error/30 transition-colors"
          onClick={onDelete}
          disabled={busy}
        >
          Delete
        </button>
        {moveTargets.length > 1 && (
          <select
            className="flex-1 min-w-[120px] border border-secondary-50 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
            value={stepId}
            onChange={(event) => onMove(Number(event.target.value))}
          >
            {moveTargets.map((target) => (
              <option key={target.board_step_id} value={target.board_step_id}>
                {target.step_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isEditing && (
        <div className="space-y-2 border-t border-secondary-50 pt-3 bg-primary -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
          <input
            type="text"
            placeholder="Business name"
            value={form.business}
            onChange={(e) => onChange("business", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            placeholder="Category"
            value={form.person_type}
            onChange={(e) => onChange("person_type", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Website"
              value={form.website}
              onChange={(e) => onChange("website", e.target.value)}
              className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              placeholder="License #"
              value={form.license_num}
              onChange={(e) => onChange("license_num", e.target.value)}
              className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
            />
          </div>
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent resize-none"
            rows={3}
          />
          <button
            className="w-full bg-accent hover:bg-accent/90 text-white rounded py-2 text-xs font-semibold transition-colors disabled:opacity-50"
            onClick={() => {
              onSave(form);
              setIsEditing(false);
            }}
            disabled={busy}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

const PropertyCardView = ({
  property,
  stepId,
  moveTargets,
  busy,
  onSave,
  onDelete,
  onMove,
}: {
  property: PropertyCard;
  stepId: number;
  moveTargets: BoardStepCard[];
  busy: boolean;
  onSave: (updates: {
    property_name?: string;
    notes?: string;
    mls_number?: string;
  }) => void;
  onDelete: () => void;
  onMove: (targetStepId: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    property_name: property.property_name ?? "",
    notes: property.notes ?? "",
    mls_number: property.mls_number ?? "",
  });

  useEffect(() => {
    setForm({
      property_name: property.property_name ?? "",
      notes: property.notes ?? "",
      mls_number: property.mls_number ?? "",
    });
  }, [
    property.property_id,
    property.property_name,
    property.notes,
    property.mls_number,
  ]);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div 
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "card",
          JSON.stringify({
            cardId: property.property_id,
            fromStepId: stepId,
            cardType: "property",
          })
        );
      }}
      className="bg-white rounded-lg p-4 space-y-2 box-shadow-sm border-l-4 border-accent hover:shadow-lg transition-shadow group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-secondary truncate">
            {property.property_name ?? "Unnamed property"}
          </p>
          {property.address && (
            <p className="text-xs text-secondary-50 mt-1 truncate">{`${property.address.street_1 ?? ""} ${property.address.city ?? ""}`}</p>
          )}
          {property.mls_number && (
            <p className="text-xs text-accent font-medium mt-1">MLS: {property.mls_number}</p>
          )}
        </div>
        <span className="text-xs font-bold text-accent bg-primary px-2 py-1 rounded whitespace-nowrap">
          PROPERTY
        </span>
      </div>
      {property.notes && (
        <p className="text-xs text-secondary whitespace-pre-wrap line-clamp-3">
          {property.notes}
        </p>
      )}
      <div className="flex flex-wrap gap-1 text-xs pt-2 border-t border-secondary-50">
        <button
          className="px-2 py-1 rounded bg-primary text-accent hover:bg-primary/80 transition-colors"
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {isEditing ? "Close" : "Edit"}
        </button>
        <button
          className="px-2 py-1 rounded bg-error/20 text-error hover:bg-error/30 transition-colors"
          onClick={onDelete}
          disabled={busy}
        >
          Delete
        </button>
        {moveTargets.length > 1 && (
          <select
            className="flex-1 min-w-[120px] border border-secondary-50 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
            value={stepId}
            onChange={(event) => onMove(Number(event.target.value))}
          >
            {moveTargets.map((target) => (
              <option key={target.board_step_id} value={target.board_step_id}>
                {target.step_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isEditing && (
        <div className="space-y-2 border-t border-secondary-50 pt-3 bg-primary -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
          <input
            type="text"
            placeholder="Property name"
            value={form.property_name}
            onChange={(e) => onChange("property_name", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <input
            type="text"
            placeholder="MLS #"
            value={form.mls_number}
            onChange={(e) => onChange("mls_number", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className="w-full px-3 py-2 rounded border border-secondary-50 text-sm text-secondary focus:outline-none focus:border-accent resize-none"
            rows={3}
          />
          <button
            className="w-full bg-accent hover:bg-accent/90 text-white rounded py-2 text-xs font-semibold transition-colors disabled:opacity-50"
            onClick={() => {
              onSave(form);
              setIsEditing(false);
            }}
            disabled={busy}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};
