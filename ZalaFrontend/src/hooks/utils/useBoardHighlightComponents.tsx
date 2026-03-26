import type { IHighlightComponentDims } from "./types";
import { useDimensions } from "./useDimensions";

export const useBoardHighlightComponents = () => {
  const [boardHeaderRef, boardHeaderDims, _setBoardHeaderDims, boardHeaderCount] =
    useDimensions();

  const [boardSettingsRef, boardSettingsDims, _setBoardSettingsDims, boardSettingsCount] =
    useDimensions();

  const [boardColumnsRef, boardColumnsDims, _setBoardColumnsDims, boardColumnsCount] =
    useDimensions();

  const highlightComponentDims: (IHighlightComponentDims | null)[] = [
    null, // Step 0: Board Overview (modal)
    { ref: boardHeaderRef, dims: boardHeaderDims }, // Step 1: Edit Board
    { ref: boardSettingsRef, dims: boardSettingsDims }, // Step 2: Board Settings
    { ref: boardColumnsRef, dims: boardColumnsDims }, // Step 3: Board Steps
  ];

  const highlightComponentDimsChange = [
    0,
    boardHeaderCount,
    boardSettingsCount,
    boardColumnsCount,
  ];

  return {
    refs: {
      boardHeaderRef,
      boardSettingsRef,
      boardColumnsRef,
    },
    highlightComponentDims,
    highlightComponentDimsChange,
  };
};
