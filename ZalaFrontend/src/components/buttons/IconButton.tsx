import clsx from "clsx";
import { Icon, Icons } from "../icons";
import {
  getIconButtonBgColor,
  getIconButtonColor,
  IconButtonVariant,
} from "./IconButtonVariant";
import { useCallback } from "react";

type IconButtonProps = {
  name: Icons;
  variant?: IconButtonVariant;

  size?: number;
  scale?: number;
  shadow?: boolean;
  borderRadius?: number;
  disableOpacity?: boolean;

  onClick?: () => void;
};

export const IconButton = ({
  name,
  variant: propVariant,
  size,
  scale,
  shadow = true,
  disableOpacity = false,
  borderRadius = 15,
  onClick,
}: IconButtonProps) => {
  const variant = propVariant ?? IconButtonVariant.Secondary;

  const getBgColor = useCallback(getIconButtonBgColor, []);
  const getColor = useCallback(getIconButtonColor, []);

  return (
    <div
      style={{ borderRadius, scale }}
      className={clsx(
        "p-2.5 relative overflow-hidden transition-[scale] duration-75 active:scale-[.9]",
        onClick ? "cursor-pointer" : "",
        shadow ? "box-shadow-sm" : "",
        getBgColor(variant)
      )}
    >
      <Icon name={name} color={getColor(variant)} size={size} />
      <div
        onClick={onClick}
        className={clsx(
          "absolute z-1 top-0 left-0 bottom-0 right-0",
          onClick && !disableOpacity
            ? "bg-[var(--color-secondary)] opacity-0 hover:opacity-25"
            : ""
        )}
      ></div>
    </div>
  );
};
