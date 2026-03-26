import React, { useCallback } from "react";
import type { IBoardStepCard, IKanbanBoard } from "../../../interfaces";
import { IconButtonVariant, Icons, type Actions } from "../../../components";
import { CONFIG, CSSVars } from "../../../config";

export type BoardCardProps = {
  board: IKanbanBoard;
  expandable?: ExpandedBoardProps;
  componentId?: string;
  hoverable?: boolean;
  headerRef?: React.RefObject<HTMLDivElement | null>;
  columnsRef?: React.RefObject<HTMLDivElement | null>;
  settingsRef?: React.RefObject<HTMLDivElement | null>;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

type ExpandedBoardProps = {
  expanded: boolean;
  boardName: string;
  stepName: string;
  stepNameId: number;
  editable?: boolean;
  onTrashBtn?: () => void;
  onBoardNameChange: (val: string) => void;
  onBoardStepNameChange: (val: string, stepId: number) => void | Promise<void>;
  onBackBtn?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onDeleteStep?: (stepId: number) => void;
  onSettingsBtn?: () => void;
  reloadBoards: () => Promise<void>;
};

const SIZE = 300;

export const useBoardCard = ({ board, expandable, settingsRef }: BoardCardProps) => {
  const size = expandable ? "100%" : SIZE;
  const expanded = expandable?.expanded;

  const numOfSteps = expandable?.expanded
    ? board.boardSteps.length
    : Math.min(5, board.boardSteps.length);
  const steps = board.boardSteps.filter((_step, i) => i < numOfSteps);

  const actions: (Actions | null)[] = expanded
    ? [
        expandable.onBackBtn
          ? {
              type: "iconBtn",
              side: "left",
              iconBtnProps: {
                name: Icons.Back,
                scale: CSSVars.icons.scale.normal,
                onClick: expandable.onBackBtn,
              },
            }
          : null,
        expandable.onSettingsBtn
          ? {
              type: "iconBtn",
              side: "right",
              ref: settingsRef,
              iconBtnProps: {
                name: Icons.Settings,
                variant: IconButtonVariant.Secondary,
                scale: CSSVars.icons.scale.normal,
                onClick: expandable.onSettingsBtn,
              },
            }
          : null,
        expandable.onTrashBtn
          ? {
              type: "iconBtn",
              side: "right",
              iconBtnProps: {
                name: Icons.Trash,
                variant: IconButtonVariant.Secondary,
                scale: CSSVars.icons.scale.normal,
                onClick: expandable.onTrashBtn,
              },
            }
          : null,
      ]
    : [];

  const calcStepItemsHeight = useCallback(
    (step: IBoardStepCard) => {
      const items = getStepItems(step);
      const boundedItemCount = Math.min(CONFIG.maxBoardItemCards, items.length);
      const height = boundedItemCount === 0 ? 1 : 2.5 * boundedItemCount;
      return `${height * 10}%`;
    },
    [board.boardSteps.length],
  );

  const getStepItems = useCallback(
    (value: IBoardStepCard) => {
      return value.properties.length > 0 ? value.properties : value.leads;
    },
    [board.boardSteps.length],
  );

  return {
    steps,
    size,
    expanded,

    actions,
    calcStepItemsHeight,
  };
};
