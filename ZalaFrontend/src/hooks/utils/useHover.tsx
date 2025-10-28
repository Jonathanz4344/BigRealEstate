import React from "react";
import { useBoolean } from "./useBoolean";

type UseHoverProps = {
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
};

export const useHover = (props?: UseHoverProps): [boolean, UseHoverProps] => {
  const [isHovered, _onHover, _onHoverDone] = useBoolean();
  const onMouseEnter = (e: React.MouseEvent) => {
    _onHover();
    if (props?.onMouseEnter) props.onMouseEnter(e);
  };
  const onMouseLeave = (e: React.MouseEvent) => {
    _onHoverDone();
    if (props?.onMouseLeave) props.onMouseLeave(e);
  };
  const onBlur = (e: React.FocusEvent) => {
    _onHoverDone();
    if (props?.onBlur) props.onBlur(e);
  };
  const hoverProps = {
    onMouseEnter,
    onMouseLeave,
    onBlur,
  };
  return [isHovered, hoverProps];
};
