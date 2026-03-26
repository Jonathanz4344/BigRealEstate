import { useTutorialModal } from "./useTutorialModal";
import { TextPlacement, useHighlightComponentStore } from "../../../stores";
import { useEffect, useRef, useState } from "react";
import {
  useDimensions,
  useOnTutorialModalChange,
  useTimeoutEffect,
} from "../../utils";
import { numStrToNum, type NumOrStr } from "../../../utils";

type TutorialTextDims = {
  width: number;
  top: number;
  left: number;
};

export const useTutorialHighlightComponentModal = ({
  onClose = () => {},
}: {
  onClose?: () => void;
}) => {
  const TUTORIAL_TEXT_WIDTH = Math.round(document.body.clientWidth / 3);
  const highlightComponentStore = useHighlightComponentStore();

  const hiddenTextTimeoutRef = useRef<number | null>(null);

  const { step, tutorialText, nextTutorial } = useTutorialModal({
    onClose,
  });
  const onTutorialModalChange = useOnTutorialModalChange();

  const [textRef, textDims] = useDimensions();
  const [tutorialTextDims, setTutorialTextDims] = useState<TutorialTextDims>({
    width: TUTORIAL_TEXT_WIDTH,
    top: 0,
    left: 0,
  });

  const [hiddenText, setHiddenText] = useState(true);

  const currentStepDims =
    step !== -1
      ? highlightComponentStore.highlightComponentDims[step]
      : undefined;
  const currentStepPosition =
    step !== -1 ? highlightComponentStore.textPlacement[step] : undefined;
  const Component =
    step !== -1 ? highlightComponentStore.components[step] : null;

  useEffect(() => {
    calculateTextDims();
  }, []);

  useTimeoutEffect(
    () => {
      onTutorialModalChange(step);
    },
    [step],
    50,
  );

  useTimeoutEffect(
    () => {
      calculateTextDims();
    },
    [
      highlightComponentStore.textPlacement,
      currentStepDims?.dims.screenY,
      currentStepDims?.dims.screenX,
      currentStepDims?.dims.width,
      currentStepDims?.dims.height,
      textDims.height,
      textDims.width,
    ],
    250,
  );

  const calculateTextDims = () => {
    const newDims: TutorialTextDims = {
      width: TUTORIAL_TEXT_WIDTH,
      top: 0,
      left: 0,
    };

    if (!currentStepDims) return;

    newDims.top = getTopPosition(textDims.height);
    newDims.left = getLeftPosition(textDims.width);

    textOverflowsWindowX(newDims);

    setTutorialTextDims(newDims);

    if (hiddenTextTimeoutRef.current) {
      clearTimeout(hiddenTextTimeoutRef.current);
    }

    hiddenTextTimeoutRef.current = setTimeout(() => {
      setHiddenText(false);
    }, 500);
  };

  const textOverflowsWindowX = (initialDims: TutorialTextDims) => {
    const bodyWidth = document.body.clientWidth;
    const initialDimsRight = initialDims.left + initialDims.width;

    const rightSideOverflow = initialDimsRight >= bodyWidth;
    const rightOverflowsBy = initialDimsRight - bodyWidth;

    if (rightSideOverflow)
      initialDims.width = initialDims.width - rightOverflowsBy - 30;
  };

  const getTopPosition = (givenHeight: NumOrStr) => {
    if (!currentStepDims) return 0;

    switch (currentStepPosition) {
      case TextPlacement.Top:
        return (
          numStrToNum(currentStepDims.dims.screenY) -
          numStrToNum(givenHeight) -
          10
        );
      case TextPlacement.Bottom:
        return (
          numStrToNum(currentStepDims.dims.screenY) +
          numStrToNum(currentStepDims.dims.height) +
          10
        );
      case TextPlacement.Right:
      case TextPlacement.Left:
        return (
          numStrToNum(currentStepDims.dims.screenY) +
          numStrToNum(currentStepDims.dims.height) / 2 -
          numStrToNum(givenHeight) / 2
        );

      default:
        return 0;
    }
  };

  const getLeftPosition = (givenWidth: NumOrStr) => {
    if (!currentStepDims) return 0;

    switch (currentStepPosition) {
      case TextPlacement.Left:
        return (
          numStrToNum(currentStepDims.dims.screenX) -
          numStrToNum(givenWidth) -
          10
        );
      case TextPlacement.Right:
        return (
          numStrToNum(currentStepDims.dims.screenX) +
          numStrToNum(currentStepDims.dims.width) +
          10
        );
      case TextPlacement.Bottom:
      case TextPlacement.Top:
        return (
          numStrToNum(currentStepDims.dims.screenX) +
          numStrToNum(currentStepDims.dims.width) / 2 -
          numStrToNum(givenWidth) / 2
        );
      default:
        return 0;
    }
  };

  return {
    Component,
    textRef,
    hiddenText,
    tutorialText,
    tutorialTextDims,
    dims: currentStepDims,
    nextTutorial: () => (
      setHiddenText(true),
      setTimeout(() => nextTutorial(), 150)
    ),
  };
};
