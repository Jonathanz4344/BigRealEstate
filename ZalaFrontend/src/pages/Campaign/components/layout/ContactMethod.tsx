import { Icon, Icons } from "../../../../components";
import clsx from "clsx";
import { COLORS } from "../../../../config";
import { useHover } from "../../../../hooks";

type ContactMethodProps = {
  icon: Icons;
  text: string;
};

export const ContactMethod = ({ icon, text }: ContactMethodProps) => {
  const [isHovered, hoverProps] = useHover();
  return (
    <div
      {...hoverProps}
      className={clsx(
        "w-[135px] h-[135px] rounded-[15px]",
        "flex flex-col items-center justify-center space-y-[10px] cursor-pointer",
        "border-4 border-dashed",
        isHovered ? "border-accent" : "border-secondary-50"
      )}
    >
      <Icon
        name={icon}
        color={isHovered ? COLORS.accent : COLORS.secondary50}
        scale={1.5}
      />
      <p
        className={clsx(
          "text-base font-bold",
          isHovered ? "text-accent" : "text-secondary-50"
        )}
      >
        {text}
      </p>
    </div>
  );
};
