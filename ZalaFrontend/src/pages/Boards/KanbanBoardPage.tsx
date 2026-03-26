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
import {
  Plus,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import extracted components
import {
  LeadComposerForm,
  PropertyComposerForm,
  LeadCardView,
  PropertyCardView,
  type LeadComposerState,
  type PropertyComposerState,
} from "./components";
import transition from "../../utils/transitions/transition";
const BOARD_TYPE_STORAGE_KEY = "zala-board-type-overrides";

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

const KanbanBoardPage = () => {
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
  const [boardTypeOverrides, setBoardTypeOverrides] = useState<
    Record<number, "lead" | "property">
  >(() => {
    if (typeof window === "undefined") {
      return {};
    }
    try {
      const stored = window.localStorage.getItem(BOARD_TYPE_STORAGE_KEY);
      return stored
        ? (JSON.parse(stored) as Record<number, "lead" | "property">)
        : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        BOARD_TYPE_STORAGE_KEY,
        JSON.stringify(boardTypeOverrides)
      );
    } catch {
      // no-op: storage might be unavailable (private browsing, etc.)
    }
  }, [boardTypeOverrides]);

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

  const boardComposition = useMemo(() => {
    if (!activeBoard) {
      return { hasLeads: false, hasProperties: false };
    }
    return {
      hasLeads: activeBoard.board_steps.some((step) => step.leads.length > 0),
      hasProperties: activeBoard.board_steps.some(
        (step) => step.properties.length > 0
      ),
    };
  }, [activeBoard]);

  const detectedBoardType = useMemo<"lead" | "property" | null>(() => {
    if (!activeBoard) return null;
    if (boardComposition.hasLeads && !boardComposition.hasProperties) {
      return "lead";
    }
    if (!boardComposition.hasLeads && boardComposition.hasProperties) {
      return "property";
    }
    return null;
  }, [activeBoard, boardComposition]);

  const activeBoardType = useMemo<"lead" | "property" | null>(() => {
    if (!activeBoard) return null;
    if (detectedBoardType) return detectedBoardType;
    const override = boardTypeOverrides[activeBoard.board_id];
    return override ?? "lead";
  }, [activeBoard, detectedBoardType, boardTypeOverrides]);

  useEffect(() => {
    if (!activeBoard) {
      setWarning(null);
      return;
    }
    if (boardComposition.hasLeads && boardComposition.hasProperties) {
      setWarning(
        "This board currently contains both lead and property cards. Move cards so only one type remains."
      );
    } else {
      setWarning(null);
    }
  }, [activeBoard, boardComposition]);

  useEffect(() => {
    if (!activeBoard || !detectedBoardType) return;
    setBoardTypeOverrides((prev) => {
      if (!prev[activeBoard.board_id]) {
        return prev;
      }
      const next = { ...prev };
      delete next[activeBoard.board_id];
      return next;
    });
  }, [activeBoard, detectedBoardType]);

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

  const handleBoardTypeSelection = (type: "lead" | "property") => {
    if (!activeBoard) return;
    if (detectedBoardType) {
      enqueueSnackbar(
        "Board type is locked once cards exist. Remove all cards to switch.",
        { variant: "info" }
      );
      return;
    }
    setBoardTypeOverrides((prev) => ({
      ...prev,
      [activeBoard.board_id]: type,
    }));
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

      const defaults = ["To Do", "In Progress", "Review", "Done", "Backlog"];
      const sampleSteps =
        (steps &&
          steps
            .slice(0, 5)
            .map((s) => s.trim())
            .filter((s) => s.length > 0)) ||
        defaults;

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
    await withBusy(
      "Updating board...",
      async () => {
        const { err } = await put<KanbanBoard>(
          `/api/boards/${boardId}`,
          payload
        );
        if (err) throw new Error(err);
      },
      boardId
    );
  };

  const handleDeleteBoard = async (boardId: number) => {
    await withBusy(
      "Deleting board...",
      async () => {
        const { err } = await del(`/api/boards/${boardId}`);
        if (err) throw new Error(err);
      },
      boardId === activeBoardId ? null : activeBoardId
    );
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

    await withBusy(
      "Creating step...",
      async () => {
        const { err } = await post(`/api/board-steps`, {
          board_id: boardId,
          board_column: nextColumn,
          step_name: trimmedName,
        });
        if (err) throw new Error(err);
      },
      boardId
    );
  };

  const handleDeleteStep = async (boardId: number, stepId: number) => {
    await withBusy(
      "Deleting step...",
      async () => {
        const { err } = await del(`/api/board-steps/${stepId}`);
        if (err) throw new Error(err);
      },
      boardId
    );
  };

  const handleCreateLead = async (
    stepId: number,
    form: LeadComposerState,
    imageFile?: File | null
  ) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find target step for lead");
      return;
    }
    if (activeBoardType === "property") {
      enqueueSnackbar(
        "This board is configured for property cards. Switch to leads to add lead cards.",
        { variant: "warning" }
      );
      return;
    }
    let createdLeadId: number | null = null;

    await withBusy(
      "Creating lead...",
      async () => {
        const payload: LeadComposerState = {
          business: form.business?.trim() ?? "",
          person_type: form.person_type?.trim() ?? "",
          website: form.website?.trim() ?? "",
          license_num: form.license_num?.trim() ?? "",
          notes: form.notes?.trim() ?? "",
        };
        const { data, err } = await post<LeadCard>(`/api/leads`, payload);
        if (err || !data) throw new Error(err ?? "Unable to create lead");
        createdLeadId = data.lead_id;

        const newLeadIds = [...(step.leads ?? []).map((lead) => lead.lead_id)];
        newLeadIds.push(data.lead_id);

        const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
          lead_ids: newLeadIds,
        });
        if (stepErr) throw new Error(stepErr);
      },
      step.board_id
    );

    if (imageFile && createdLeadId) {
      await handleUploadLeadImage(createdLeadId, imageFile);
    }
  };

  const handleUpdateLead = async (
    leadId: number,
    updates: LeadComposerState
  ) => {
    const payload: LeadComposerState = {
      business: updates.business?.trim() ?? "",
      person_type: updates.person_type?.trim() ?? "",
      website: updates.website?.trim() ?? "",
      license_num: updates.license_num?.trim() ?? "",
      notes: updates.notes?.trim() ?? "",
    };
    await withBusy(
      "Updating lead...",
      async () => {
        const { err } = await put(`/api/leads/${leadId}`, payload);
        if (err) throw new Error(err);
      },
      activeBoardId
    );
  };

  const handleDeleteLead = async (leadId: number, stepId: number) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find step for lead removal");
      return;
    }

    await withBusy(
      "Deleting lead...",
      async () => {
        const remainingIds = step.leads
          .filter((lead) => lead.lead_id !== leadId)
          .map((lead) => lead.lead_id);

        const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
          lead_ids: remainingIds,
        });
        if (stepErr) throw new Error(stepErr);

        const { err } = await del(`/api/leads/${leadId}`);
        if (err) throw new Error(err);
      },
      step.board_id
    );
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

    await withBusy(
      "Moving lead...",
      async () => {
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
      },
      fromStep.board_id
    );
  };

  const handleCreateProperty = async (
    stepId: number,
    form: PropertyComposerState,
    imageFile?: File | null
  ) => {
    const step = findStep(stepId);
    if (!step) {
      setError("Unable to find target step for property");
      return;
    }
    if (activeBoardType === "lead") {
      enqueueSnackbar(
        "This board is configured for lead cards. Switch to properties to add property cards.",
        { variant: "warning" }
      );
      return;
    }

    const trimmedName = form.property_name.trim();
    const street = form.address.street_1.trim();
    const city = form.address.city.trim();
    const state = form.address.state.trim();
    const zip = form.address.zipcode.trim();

    let createdProperty: PropertyCard | null = null;

    await withBusy(
      "Creating property...",
      async () => {
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
        createdProperty = property;

        const propertyIds = [
          ...(step.properties ?? []).map((prop) => prop.property_id),
          property.property_id,
        ];

        const { err: stepErr } = await put(`/api/board-steps/${stepId}`, {
          property_ids: propertyIds,
        });
        if (stepErr) throw new Error(stepErr);
      },
      step.board_id
    );

    if (imageFile && createdProperty) {
      await handleUploadPropertyImage(createdProperty, imageFile);
    }
  };

  const handleUpdateProperty = async (
    property: PropertyCard,
    updates: {
      property_name?: string;
      notes?: string;
      mls_number?: string;
      address?: {
        street_1?: string;
        city?: string;
        state?: string;
        zipcode?: string;
      };
    }
  ) => {
    if (!property.address_id) {
      enqueueSnackbar("Cannot update property without an address", {
        variant: "warning",
      });
      return;
    }

    const propertyPayload: {
      property_name?: string;
      notes?: string;
      mls_number?: string;
    } = {};
    if (updates.property_name !== undefined) {
      propertyPayload.property_name = updates.property_name.trim();
    }
    if (updates.notes !== undefined) {
      propertyPayload.notes = updates.notes.trim();
    }
    if (updates.mls_number !== undefined) {
      propertyPayload.mls_number = updates.mls_number.trim();
    }

    await withBusy(
      "Updating property...",
      async () => {
        if (updates.address) {
          const addressPayload: {
            street_1?: string;
            city?: string;
            state?: string;
            zipcode?: string;
          } = {};
          if (updates.address.street_1 !== undefined) {
            addressPayload.street_1 = updates.address.street_1.trim();
          }
          if (updates.address.city !== undefined) {
            addressPayload.city = updates.address.city.trim();
          }
          if (updates.address.state !== undefined) {
            addressPayload.state = updates.address.state.trim();
          }
          if (updates.address.zipcode !== undefined) {
            addressPayload.zipcode = updates.address.zipcode.trim();
          }

          if (Object.keys(addressPayload).length > 0) {
            const { err: addressErr } = await put(
              `/api/addresses/${property.address_id}`,
              addressPayload
            );
            if (addressErr) throw new Error(addressErr);
          }
        }

        if (Object.keys(propertyPayload).length > 0) {
          const { err } = await put(
            `/api/addresses/${property.address_id}/properties/${property.property_id}`,
            propertyPayload
          );
          if (err) throw new Error(err);
        }
      },
      activeBoardId
    );
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

    await withBusy(
      "Deleting property...",
      async () => {
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
      },
      step.board_id
    );
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

    await withBusy(
      "Moving property...",
      async () => {
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
      },
      fromStep.board_id
    );
  };

  const handleUploadLeadImage = async (leadId: number, file: File) => {
    await withBusy(
      "Uploading lead image...",
      async () => {
        const formData = new FormData();
        formData.append("file", file);
        const { err } = await post(`/api/leads/${leadId}/image`, formData, {
          isFormData: true,
        });
        if (err) throw new Error(err);
      },
      activeBoardId
    );
  };

  const resolvePropertyAddressId = (property: PropertyCard): number | null => {
    if (property.address_id) return property.address_id;
    return property.address?.address_id ?? null;
  };

  const handleUploadPropertyImage = async (
    property: PropertyCard,
    file: File
  ) => {
    const addressId = resolvePropertyAddressId(property);
    if (!addressId) {
      enqueueSnackbar(
        "Property must have an address before uploading an image",
        {
          variant: "warning",
        }
      );
      return;
    }

    await withBusy(
      "Uploading property image...",
      async () => {
        const formData = new FormData();
        formData.append("file", file);
        const { err } = await post(
          `/api/addresses/${addressId}/properties/${property.property_id}/image`,
          formData,
          { isFormData: true }
        );
        if (err) throw new Error(err);
      },
      activeBoardId
    );
  };

  // Gallery image handlers for multiple images
  const handleUploadLeadGalleryImage = async (leadId: number, file: File) => {
    await withBusy(
      "Uploading image...",
      async () => {
        const formData = new FormData();
        formData.append("file", file);
        const { err } = await post(`/api/leads/${leadId}/images`, formData, {
          isFormData: true,
        });
        if (err) throw new Error(err);
      },
      activeBoardId
    );
  };

  const handleDeleteLeadGalleryImage = async (
    leadId: number,
    imageId: number
  ) => {
    await withBusy(
      "Deleting image...",
      async () => {
        const { err } = await del(`/api/leads/${leadId}/images/${imageId}`);
        if (err) throw new Error(err);
      },
      activeBoardId
    );
  };

  const handleUploadPropertyGalleryImage = async (
    property: PropertyCard,
    file: File
  ) => {
    const addressId = resolvePropertyAddressId(property);
    if (!addressId) {
      enqueueSnackbar(
        "Property must have an address before uploading an image",
        {
          variant: "warning",
        }
      );
      return;
    }

    await withBusy(
      "Uploading image...",
      async () => {
        const formData = new FormData();
        formData.append("file", file);
        const { err } = await post(
          `/api/addresses/${addressId}/properties/${property.property_id}/images`,
          formData,
          { isFormData: true }
        );
        if (err) throw new Error(err);
      },
      activeBoardId
    );
  };

  const handleDeletePropertyGalleryImage = async (
    property: PropertyCard,
    imageId: number
  ) => {
    const addressId = resolvePropertyAddressId(property);
    if (!addressId) {
      enqueueSnackbar("Property must have an address", { variant: "warning" });
      return;
    }

    await withBusy(
      "Deleting image...",
      async () => {
        const { err } = await del(
          `/api/addresses/${addressId}/properties/${property.property_id}/images/${imageId}`
        );
        if (err) throw new Error(err);
      },
      activeBoardId
    );
  };

  const handleRenameStep = async (
    boardId: number,
    stepId: number,
    newName: string
  ) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    await withBusy(
      "Updating step...",
      async () => {
        const { err } = await put(`/api/board-steps/${stepId}`, {
          step_name: trimmedName,
        });
        if (err) throw new Error(err);
      },
      boardId
    );
  };

  // ========== LOCAL COMPONENTS ==========
  // These components are kept local because they use handlers directly

  const BoardList = () => {
    const [name, setName] = useState("");

    const onSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      handleCreateBoard(name);
      setName("");
    };

    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b border-secondary-50/30">
          <div>
            <h2 className="text-xl font-bold text-secondary">Boards</h2>
            <p className="text-secondary-50 text-xs">Manage your projects</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
            className="p-2 rounded-lg hover:bg-secondary-50/20 text-secondary transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden">
          <div className="space-y-1 overflow-auto flex-1">
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
                    "flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition-all duration-200",
                    isActive
                      ? "bg-accent text-white shadow-md"
                      : "hover:bg-secondary-50/20 text-secondary"
                  )}
                  onClick={() => setActiveBoardId(board.board_id)}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {board.board_name}
                    </span>
                    <span
                      className={clsx(
                        "text-[11px]",
                        isActive ? "text-white/80" : "text-secondary-50"
                      )}
                    >
                      {ownerLabel}
                    </span>
                  </div>

                  <button
                    className="ml-2 p-1.5 hover:bg-white/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteBoard(board.board_id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            {boards.length === 0 && (
              <p className="text-sm text-secondary-50 text-center py-8">
                No boards yet
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-secondary-50/30 p-4">
          <form className="flex gap-2" onSubmit={onSubmit} autoComplete="off">
            <input
              type="text"
              placeholder="+ Add board"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-secondary-50/10 border border-transparent text-secondary text-sm placeholder-secondary-50 focus:outline-none focus:border-accent focus:bg-white transition-colors"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
              disabled={!name.trim() || !!busy}
            >
              <Plus size={18} />
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
    const boardHasCards =
      boardComposition.hasLeads || boardComposition.hasProperties;
    const boardTypeLabel =
      activeBoardType === "property" ? "Properties" : "Leads";

    return (
      <div className="flex items-center gap-4 px-6 py-3 bg-background border-b border-secondary-50/30">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-secondary truncate">
            {activeBoard.board_name}
          </h1>
          <p className="text-xs text-secondary-50">
            Owner: {ownedByCurrent ? "You" : ownerName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary-50/10 rounded-lg px-3 py-1.5">
            <span className="text-xs text-secondary-50">Type:</span>
            {boardHasCards ? (
              <span className="text-xs font-semibold text-secondary">
                {boardTypeLabel}
              </span>
            ) : (
              <>
                {(["lead", "property"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={clsx(
                      "px-2 py-1 rounded text-xs font-medium transition-colors",
                      activeBoardType === type
                        ? "bg-accent text-white"
                        : "text-secondary-50 hover:text-secondary"
                    )}
                    onClick={() => handleBoardTypeSelection(type)}
                  >
                    {type === "lead" ? "Leads" : "Properties"}
                  </button>
                ))}
              </>
            )}
          </div>

          <button
            type="button"
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:bg-secondary-50/20 transition-colors"
            onClick={() =>
              handleUpdateBoard(activeBoard.board_id, {
                user_id: currentUser?.userId ?? null,
              })
            }
            disabled={!currentUser || ownedByCurrent}
          >
            {ownedByCurrent ? "Your Board" : "Claim"}
          </button>
          <button
            className="p-2 rounded-lg text-error hover:bg-error/10 transition-colors"
            onClick={() => handleDeleteBoard(activeBoard.board_id)}
            disabled={!!busy}
            title="Delete board"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  };

  const AddListCard = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [stepName, setStepName] = useState("");

    if (!activeBoard) return null;

    const handleSubmit = (event: React.FormEvent) => {
      event.preventDefault();
      if (!stepName.trim()) return;
      handleCreateStep(activeBoard.board_id, stepName);
      setStepName("");
      setIsAdding(false);
    };

    if (!isAdding) {
      return (
        <button
          onClick={() => setIsAdding(true)}
          className="min-w-[320px] h-fit px-4 py-3 rounded-xl bg-secondary-50/20 hover:bg-secondary-50/30 text-secondary-50 text-base font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add another list
        </button>
      );
    }

    return (
      <div className="min-w-[320px] rounded-xl bg-secondary-50/20 p-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            autoFocus
            type="text"
            placeholder="Enter list title..."
            value={stepName}
            onChange={(e) => setStepName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-secondary-50/50 bg-white text-sm text-secondary focus:outline-none focus:border-accent"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
              disabled={!stepName.trim() || !!busy}
            >
              Add list
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setStepName("");
              }}
              className="p-1.5 rounded-lg text-secondary-50 hover:text-secondary hover:bg-secondary-50/20 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  };

  const StepColumn = ({
    step,
    boardType,
  }: {
    step: BoardStepCard;
    boardType: "lead" | "property" | null;
  }) => {
    const [composerOpen, setComposerOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(step.step_name);
    const [leadForm, setLeadForm] = useState<LeadComposerState>(
      createDefaultLeadForm()
    );
    const [propertyForm, setPropertyForm] = useState<PropertyComposerState>(
      createDefaultPropertyForm()
    );
    const [leadImageFile, setLeadImageFile] = useState<File | null>(null);
    const [propertyImageFile, setPropertyImageFile] = useState<File | null>(
      null
    );
    const [dragOverStepId, setDragOverStepId] = useState<number | null>(null);

    const resolvedBoardType = boardType ?? "lead";
    const isLeadBoard = resolvedBoardType === "lead";

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

    const moveTargets = activeBoard?.board_steps ?? [];

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

        if (boardType && type !== boardType) {
          return;
        }

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
          "rounded-xl p-4 space-y-4 min-w-[320px] max-w-[320px] h-fit flex flex-col transition-all",
          dragOverStepId === step.board_step_id
            ? "bg-accent/20"
            : "bg-secondary-50/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Header with editable title */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
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
                  className="flex-1 px-2 py-1 rounded border border-accent bg-white text-sm font-semibold focus:outline-none text-secondary"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 hover:bg-white/50 rounded transition-colors text-accent"
                  title="Save"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(step.step_name);
                    setIsEditingTitle(false);
                  }}
                  className="p-1 hover:bg-error/20 rounded transition-colors text-error"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <h3
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-semibold text-secondary truncate cursor-pointer hover:text-accent transition-colors py-1"
              >
                {step.step_name}
              </h3>
            )}
          </div>
          <button
            className="p-1 rounded hover:bg-white/50 text-secondary-50 hover:text-secondary transition-colors"
            onClick={() => handleDeleteStep(step.board_id, step.board_step_id)}
            title="Delete list"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Cards Container */}
        <div className="space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {step.leads.map((lead) => (
            <LeadCardView
              key={lead.lead_id}
              lead={lead}
              stepId={step.board_step_id}
              moveTargets={moveTargets}
              busy={!!busy}
              onSave={(updates) => handleUpdateLead(lead.lead_id, updates)}
              onDelete={() =>
                handleDeleteLead(lead.lead_id, step.board_step_id)
              }
              onMove={(targetStepId) =>
                handleMoveLead(lead.lead_id, step.board_step_id, targetStepId)
              }
              onUploadGalleryImage={(file) =>
                handleUploadLeadGalleryImage(lead.lead_id, file)
              }
              onDeleteGalleryImage={(imageId) =>
                handleDeleteLeadGalleryImage(lead.lead_id, imageId)
              }
            />
          ))}

          {step.properties.map((property) => (
            <PropertyCardView
              key={property.property_id}
              property={property}
              stepId={step.board_step_id}
              moveTargets={moveTargets}
              busy={!!busy}
              onSave={(updates) => handleUpdateProperty(property, updates)}
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
              onUploadGalleryImage={(file) =>
                handleUploadPropertyGalleryImage(property, file)
              }
              onDeleteGalleryImage={(imageId) =>
                handleDeletePropertyGalleryImage(property, imageId)
              }
            />
          ))}
        </div>

        {/* Add Card Button */}
        <button
          className="w-full rounded-lg py-2 text-sm text-secondary-50 hover:bg-white/50 hover:text-secondary transition-colors flex items-center gap-2 px-2"
          onClick={() => setComposerOpen((prev) => !prev)}
        >
          <Plus size={16} />
          {composerOpen ? "Close" : "Add a card"}
        </button>

        {/* Composer */}
        {composerOpen && (
          <div className="space-y-3 border-t border-secondary-50 pt-3 bg-primary rounded-lg p-3">
            <p className="text-xs text-secondary-50">
              {isLeadBoard
                ? "This board is configured for lead cards."
                : "This board is configured for property cards."}
            </p>

            {isLeadBoard ? (
              <LeadComposerForm
                disabled={!!busy}
                form={leadForm}
                onChange={updateLeadForm}
                imageFile={leadImageFile}
                onImageChange={setLeadImageFile}
                onSubmit={() => {
                  handleCreateLead(step.board_step_id, leadForm, leadImageFile);
                  setLeadForm(createDefaultLeadForm());
                  setLeadImageFile(null);
                  setComposerOpen(false);
                }}
              />
            ) : (
              <PropertyComposerForm
                disabled={!!busy}
                form={propertyForm}
                onChange={updatePropertyForm}
                onAddressChange={updatePropertyAddress}
                imageFile={propertyImageFile}
                onImageChange={setPropertyImageFile}
                onSubmit={() => {
                  handleCreateProperty(
                    step.board_step_id,
                    propertyForm,
                    propertyImageFile
                  );
                  setPropertyForm(createDefaultPropertyForm());
                  setPropertyImageFile(null);
                  setComposerOpen(false);
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // ========== MAIN RENDER ==========

  return (
    <div className="flex flex-1 bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={clsx(
          "flex-shrink-0 h-full overflow-auto border-r border-secondary-50/30 bg-background transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-72" : "w-0"
        )}
      >
        <BoardList />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Sidebar Toggle (always visible when closed) */}
        {!sidebarOpen && (
          <div className="flex-shrink-0 px-4 py-2 border-b border-secondary-50/30 bg-background">
            <button
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
              className="p-2 rounded-lg hover:bg-secondary-50/20 text-secondary transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

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
              <h2 className="text-2xl font-bold text-secondary mb-2">
                No Board Selected
              </h2>
              <p className="text-secondary-50">
                Create a board to get started with your project management.
              </p>
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
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-4 p-4 h-full min-w-min items-start">
                {activeBoard.board_steps
                  .slice()
                  .sort((a, b) => a.board_column - b.board_column)
                  .map((step) => (
                    <StepColumn
                      key={step.board_step_id}
                      step={step}
                      boardType={activeBoardType}
                    />
                  ))}
                <AddListCard />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
 export default transition(KanbanBoardPage);