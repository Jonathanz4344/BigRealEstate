import React from "react";
import { useBoolean } from "./useBoolean";

type UseHoverProps = {
  onMouseOver: (e: React.MouseEvent) => void;
  onMouseOut: (e: React.MouseEvent) => void;
  onBlur: (e: React.FocusEvent) => void;
  onClick: () => void;
};

export const useHover = (
  props?: Partial<UseHoverProps>
): [boolean, UseHoverProps] => {
  const [isHovered, _onHover, _onHoverDone] = useBoolean();
  const onMouseOver = (e: React.MouseEvent) => {
    _onHover();
    if (props?.onMouseOver) props.onMouseOver(e);
  };
  const onMouseOut = (e: React.MouseEvent) => {
    _onHoverDone();
    if (props?.onMouseOut) props.onMouseOut(e);
  };

  const onBlur = (e: React.FocusEvent) => {
    _onHoverDone();
    if (props?.onBlur) props.onBlur(e);
  };
  const hoverProps = {
    onMouseOver,
    onMouseOut,
    onBlur,
    onClick: () => (_onHoverDone(), props?.onClick && props.onClick()),
  };
  return [isHovered, hoverProps];
};
