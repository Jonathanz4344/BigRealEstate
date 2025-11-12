import { Icon, Icons } from "../../../../components";
import clsx from "clsx";
import { COLORS } from "../../../../config";
import { useHover } from "../../../../hooks";

type ContactMethodProps = {
  icon: Icons;
  text: string;
  active?: boolean;
  onClick?: () => void;
};

export const ContactMethod = ({
  icon,
  text,
  active,
  onClick,
}: ContactMethodProps) => {
  const [isHovered, hoverProps] = useHover();
  const isActive = isHovered || active;
  return (
    <div
      {...hoverProps}
      onClick={onClick}
      className={clsx(
        "w-[135px] h-[135px] rounded-[15px]",
        "flex flex-col items-center justify-center space-y-[10px] cursor-pointer",
        "border-4 border-dashed",
        isActive ? "border-accent" : "border-secondary-50"
      )}
    >
      <Icon
        name={icon}
        color={isActive ? COLORS.accent : COLORS.secondary50}
        scale={1.5}
      />
      <p
        className={clsx(
          "text-base font-bold",
          isActive ? "text-accent" : "text-secondary-50"
        )}
      >
        {text}
      </p>
    </div>
  );
};
