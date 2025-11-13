import clsx from "clsx";
import { useHover } from "../../hooks";
import { Icon, Icons } from "../icons";
import { COLORS } from "../../config";

type MenuButtonProps = {
  text: string;
  bold?: boolean;
  onClick?: () => void;
};

export const MenuButton = ({ text, bold, onClick }: MenuButtonProps) => {
  const [isHovered, hoverProps] = useHover({ onClick });

  const isActive = onClick && isHovered;
  return (
    <div
      {...hoverProps}
      className={clsx(
        "w-full rounded-lg border p-4 flex flex-row items-center justify-between bg-white",
        isActive
          ? "border-2 border-accent text-accent cursor-pointer"
          : "border-secondary-50 text-secondary"
      )}
    >
      <p className={clsx("text-base", bold || isActive ? "font-semibold" : "")}>
        {text}
      </p>
      <Icon
        name={Icons.Chevron}
        color={isActive ? COLORS.accent : COLORS.secondary}
      />
    </div>
  );
};
