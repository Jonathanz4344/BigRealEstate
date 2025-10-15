import { useCallback } from "react";
import { Icon, Icons } from "../icons";
import {
  ButtonVariant,
  getButtonBgColor,
  getButtonTextColor,
  getButtonTextColorHex,
} from "./ButtonVariant";
import clsx from "clsx";
import { useBoolean } from "../../hooks";

type ButtonProps = {
  text: string;
  icon?: Icons;
  variant?: ButtonVariant;
  activeVariant?: ButtonVariant;
  onClick?: () => void;
};

export const Button = ({
  text,
  icon,
  variant: initialVariant = ButtonVariant.Primary,
  activeVariant,
  onClick,
}: ButtonProps) => {
  const [isActive, active, inactive] = useBoolean();

  const getBgColor = useCallback(getButtonBgColor, []);
  const getTextColor = useCallback(getButtonTextColor, []);
  const getTextHexColor = useCallback(getButtonTextColorHex, []);

  const variant = isActive ? activeVariant ?? initialVariant : initialVariant;

  return (
    <div
      onMouseEnter={active}
      onMouseLeave={inactive}
      className={clsx(
        "text-sm w-full flex flex-row items-center justify-center cursor-pointer relative group",
        "rounded-[7.5px] py-[10px] space-x-[15px]",
        "transition-[scale] duration-75 active:scale-[.95]",
        "hover:font-bold",
        getBgColor(variant),
        getTextColor(variant)
      )}
      onClick={onClick}
    >
      <span className="z-1">{text}</span>
      {icon && (
        <div className="z-1">
          <Icon scale={0.8} color={getTextHexColor(variant)} name={icon} />
        </div>
      )}
      <div
        className={clsx(
          "absolute top-0 left-0 z-0 w-full h-full rounded-[7.5px] pointer-events-none bg-secondary",
          "opacity-0",
          activeVariant ? "" : "group-hover:opacity-25"
        )}
      />
    </div>
  );
};
