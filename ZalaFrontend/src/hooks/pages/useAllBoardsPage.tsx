import { useCallback, useEffect, useState } from "react";
import { useAllBoardsPageAnimation } from "../components";
import { useAllBoardsPageAPI } from "../api";
import { useTimeoutEffect } from "../utils";
import {
  SideNavControlVariant,
  useBoardSettingsStore,
  useSideNavControlStore,
} from "../../stores";
import type { IBoardType, IKanbanBoard } from "../../interfaces";

export const useAllBoardsPage = () => {
  const apiFunctions = useAllBoardsPageAPI();
  const { selectedBoard, setSelectedBoard } = apiFunctions;

  const animationProps = useAllBoardsPageAnimation({
    onAnimationOut: () => {
      // Always runs
      setSelectedBoard(undefined);
    },
  });
  const sideNavFuncs = useSideNavControlStore();
  const boardSettingsFuncs = useBoardSettingsStore();

  const inferBoardType: IBoardType = selectedBoard?.boardSteps.some(
    (step) => step.properties.length > 0,
  )
    ? "properties"
    : "lead";

  const [createdBoard, setCreatedBoard] = useState(-1);
  const [stepNameId, setStepNameId] = useState(-1);
  const [stepName, setStepName] = useState("");

  useEffect(() => {
    if (!selectedBoard) return;
    setBoardSettingsState();
  }, [selectedBoard?.boardName, selectedBoard?.boardType]);

  useTimeoutEffect(
    () => {
      if (createdBoard === -1) return;

      const elem = document.querySelector(`#grid-board-${createdBoard}`) as
        | HTMLDivElement
        | undefined;

      if (elem) {
        elem?.click();
        setCreatedBoard(-1);
      }
    },
    [createdBoard],
    750,
  );

  useTimeoutEffect(
    () => {
      if (stepNameId === -1) return;
      (async () => {
        await apiFunctions.updateBoardStepName(stepNameId, stepName.trim());
        setStepNameId(-1);
      })();
    },
    [stepName, stepNameId],
    750,
  );

  const selectBoard = useCallback(
    (board: IKanbanBoard) =>
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => (
        setSelectedBoard(board),
        boardSettingsFuncs.setBoardType(board.boardType as IBoardType),
        animationProps.runAnimation(e)
      ),
    [],
  );

  const onAddNewBoardBtn = async () => {
    const board = await apiFunctions.createBoard();
    if (board) setCreatedBoard(board.boardId);
  };

  const onDeleteBoardBtn = async () => {
    await apiFunctions.deleteBoard();
    animationProps.setAnimationCallback(() => {
      (async () => (
        animationProps.setAnimationCallback(() => {}),
        await apiFunctions.getBoards()
      ))();
    });
    animationProps.rewindAnimation();
  };

  const onStepNameChange = (value: string, stepId: number) => {
    if (!selectedBoard) return;
    setStepNameId(stepId);
    setStepName(value);
  };

  const setBoardSettingsState = () => {
    if (!selectedBoard) return;

    boardSettingsFuncs.setBoardName(selectedBoard?.boardName ?? "");
    boardSettingsFuncs.setBoardTypeDisabled(
      selectedBoard?.boardSteps.some(
        (step) => step.properties.length > 0 || step.leads.length > 0,
      ) ?? false,
    );
    boardSettingsFuncs.setBoardType(
      (selectedBoard?.boardType ?? inferBoardType) as IBoardType,
    );
    boardSettingsFuncs.setOnSave(onSettingsSave);
  };

  const onSettingsBtn = () => {
    sideNavFuncs.open(SideNavControlVariant.BoardSettings);
  };

  const onSettingsSave = async () => {
    await apiFunctions.updateBoardName(boardSettingsFuncs.boardName);
  };

  return {
    ...apiFunctions,
    ...animationProps,

    selected: selectedBoard?.boardId ?? -1,

    selectedBoard,
    selectBoard,
    setSelectedBoard,

    stepName,
    stepNameId,

    createdBoard,

    onAddNewBoardBtn,
    onDeleteBoardBtn,
    onStepNameChange,
    onSettingsBtn,
  };
};
