import { useEffect, useRef, useState } from "react";
import { useSnack, useTimeoutEffect } from "../utils";
import { useApi } from "./useApi";
import {
  ABoardStepCardToIBoardStepCard,
  AKanbanBoardToIKanbanBoard,
  type ABoardStepCard,
  type AKanbanBoard,
  type IKanbanBoard,
} from "../../interfaces";
import {
  useAuthStore,
  useBoardSettingsStore,
  useBoardStore,
} from "../../stores";
import { produce } from "immer";
import { DEFAULTS } from "../../config";

export const useAllBoardsPageAPI = () => {
  const { board: selectedBoard, setBoard: setSelectedBoard } = useBoardStore();
  const user = useAuthStore((state) => state.user);
  const { boardType } = useBoardSettingsStore();
  const {
    setSignal,
    updateBoard,
    createBoard: createBoardAPICall,
    createBoardStep,
    updateBoardStepName: updateBoardStepNameAPICall,
    getUserBoards,
    apiResponseError,
    deleteBoard: deleteBoardAPICall,
    deleteStep,
  } = useApi();

  const updateBoardNameRef = useRef(false);
  const updateBoardStepNameRef = useRef(false);

  const [successMsg] = useSnack();

  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);

  const [boards, setBoards] = useState<IKanbanBoard[]>([]);

  const [selectedBoardName, setSelectedBoardName] = useState("");

  const [abortController, _setAbortController] = useState(
    new AbortController(),
  );

  useEffect(() => {
    if (
      selectedBoard?.boardName &&
      selectedBoard.boardName !== selectedBoardName
    )
      setSelectedBoardName(selectedBoard.boardName);
  }, [selectedBoard?.boardName]);

  useTimeoutEffect(
    () => {
      getBoards();
    },
    [],
    250,
  );

  useTimeoutEffect(
    () => {
      updateBoardName();
    },
    [selectedBoardName],
    500,
  );

  const getBoards = async () => {
    if (boardsLoading) return;

    setBoardsLoading(true);
    const { data, err } = await getUserBoards();
    setBoardsLoading(false);

    if (err || !data)
      return apiResponseError("getting boards", err, {
        showSnack: true,
      });

    const sBoard = data.find(
      (apiBoard) => apiBoard.board_id === selectedBoard?.boardId,
    );

    setBoards(
      data
        .map(AKanbanBoardToIKanbanBoard)
        .sort((a, b) => a.boardId - b.boardId),
    );

    if (sBoard) setSelectedBoard(AKanbanBoardToIKanbanBoard(sBoard));
  };

  const createBoard = async (title?: string) => {
    if (!user || boardLoading || selectedBoard) return;

    setBoardLoading(true);
    const { err, data } = await createBoardAPICall({
      boardName: title ?? `${new Date().toLocaleString()} - New Board`,
      userId: user.userId,
    });
    setBoardLoading(false);

    if (err || !data)
      return apiResponseError("creating board", err, { showSnack: true });

    const board = AKanbanBoardToIKanbanBoard(data);
    const template = DEFAULTS.boardSteps.SE; // TODO: Allow user to pick their boards template

    await Promise.all(
      template.map(async (stepName, i) =>
        createBoardStep({ boardId: board.boardId, boardColumn: i, stepName }),
      ),
    );

    successMsg(`Board created!`);

    await getBoards();

    return board;
  };

  const updateBoardStepName = async (stepId: number, name: string) => {
    if (!selectedBoard) return;

    if (updateBoardStepNameRef.current) {
      abortController.abort();
    }
    setSignal(abortController.signal, ["updateBoardStepName"]);

    updateBoardStepNameRef.current = true;
    const { err, data } = await updateBoardStepNameAPICall({ stepId, name });
    updateBoardStepNameRef.current = false;

    if (err || !data)
      return apiResponseError("updating board step name", err, {
        showSnack: true,
      });

    selectedBoardStepAPIResponse(data);
  };

  const updateBoardName = async (name?: string) => {
    const newBoardName = name ? name : selectedBoardName;

    if (!user || !selectedBoard || newBoardName === selectedBoard?.boardName)
      return;

    if (updateBoardNameRef.current) {
      abortController.abort();
    }
    setSignal(abortController.signal, ["updateBoard"]);

    setBoardLoading(true);
    updateBoardNameRef.current = true;
    const { err, data } = await updateBoard({
      boardId: selectedBoard.boardId,
      boardName: newBoardName,
      boardType: boardType,
      userId: user.userId,
    });
    updateBoardNameRef.current = false;
    setBoardLoading(false);

    if (err || !data)
      return apiResponseError("updating a board", err, { showSnack: true });

    selectedBoardAPIResponse(data);
  };

  const deleteBoard = async () => {
    if (!selectedBoard) return;

    setBoardLoading(true);
    await deleteBoardAPICall(selectedBoard.boardId);
    setBoardLoading(false);
  };

  const onAddBoardStep = async () => {
    if (!selectedBoard) return;

    setBoardLoading(true);
    const { err, data } = await createBoardStep({
      boardId: selectedBoard.boardId,
      boardColumn: selectedBoard.boardSteps.length,
      stepName: `Step ${selectedBoard.boardSteps.length + 1}`,
    });
    setBoardLoading(false);

    if (err || !data)
      return apiResponseError(`creating board step`, err, { showSnack: true });

    selectedBoardStepAPIResponse(data);
  };

  const onRemoveBoardStep = async (stepId: number) => {
    if (!selectedBoard) return;

    setBoardLoading(true);
    const { err } = await deleteStep(stepId);
    setBoardLoading(false);

    if (err)
      return apiResponseError(`deleting board step`, err, { showSnack: true });

    setBoards((prev) =>
      produce(prev, (draft) => {
        const bIndex = draft.findIndex(
          (board) => board.boardId === selectedBoard.boardId,
        );
        if (bIndex === -1) return;
        const board = draft[bIndex];
        const sIndex = board.boardSteps.findIndex(
          (step) => step.boardStepId === stepId,
        );
        if (sIndex === -1) return;
        draft[bIndex].boardSteps = draft[bIndex].boardSteps.filter(
          (_step, i) => i !== sIndex,
        );
      }),
    );
  };

  const selectedBoardAPIResponse = (data: AKanbanBoard) => {
    const board = AKanbanBoardToIKanbanBoard(data);

    setBoards((prev) =>
      produce(prev, (draft) => {
        const index = draft.findIndex(
          (dBoard) => dBoard.boardId === board.boardId,
        );
        if (index !== -1) {
          draft[index] = board;
        } else {
          draft.push(board);
        }
      }),
    );
    setSelectedBoard(board);
  };

  const selectedBoardStepAPIResponse = (data: ABoardStepCard) => {
    const step = ABoardStepCardToIBoardStepCard(data);
    setBoards((prev) =>
      produce(prev, (draft) => {
        const boardIndex = draft.findIndex(
          (board) => board.boardId === step.boardId,
        );
        if (boardIndex === -1) return;
        const board = draft[boardIndex];
        const stepIndex = board.boardSteps.findIndex(
          (bStep) => bStep.boardStepId === step.boardStepId,
        );
        if (stepIndex === -1) {
          draft[boardIndex].boardSteps.push(step);
        } else {
          draft[boardIndex].boardSteps[stepIndex] = step;
        }
      }),
    );
  };

  return {
    boardLoading,
    boardsLoading,
    boards,
    selectedBoard,
    setSelectedBoard,
    selectedBoardName,
    setSelectedBoardName,
    getBoards,
    createBoard,
    deleteBoard,
    updateBoardStepName,
    onAddBoardStep,
    onRemoveBoardStep,
    updateBoardName,
  };
};
