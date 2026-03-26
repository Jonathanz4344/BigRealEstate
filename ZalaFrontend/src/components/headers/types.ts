import type { RefObject } from "react";
import type { IconButtonProps } from "../buttons";
import type { IconProps } from "../icons";

export enum EditablePageHeaderSize {
  Large = "Large",
  Medium = "Medium",
  Small = "Small",
}

export enum EditablePageHeaderVariant {
  Card = "Card",
  Underline = "Underline",
}

type ActionType = "icon" | "iconBtn" | "invisible";
export type ActionSide = "left" | "right";

export type Actions = {
  type: ActionType;
  side: ActionSide;
  visible?: boolean;
  ref?: RefObject<HTMLDivElement | null>;
  iconBtnProps?: IconButtonProps;
  iconProps?: IconProps;
};
