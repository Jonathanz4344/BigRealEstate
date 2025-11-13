import clsx from "clsx";
import { Icon, Icons } from "../icons";
import { COLORS } from "../../config";

type CheckboxInputProps = {
  checked: boolean;
  shadow?: boolean;
  text?: string;
  onClick: () => void;
};

export const CheckboxInput = ({
  checked,
  shadow = true,
  text,
  onClick,
}: CheckboxInputProps) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex w-full items-center space-x-3 rounded-lg border-2 px-3 py-2 text-left transition-colors bg-white cursor-pointer",
        shadow && checked ? "box-shadow-sm" : "",
        checked
          ? "border-secondary"
          : "hover:border-secondary border-secondary-50"
      )}
    >
      <Icon
        name={checked ? Icons.CheckboxChecked : Icons.CheckboxOutline}
        color={checked ? COLORS.accent : COLORS.secondary50}
      />
      <span
        className={clsx(
          "text-xl font-medium ",
          checked ? "text-secondary" : "text-secondary-50"
        )}
      >
        {text}
      </span>
    </div>
  );
};
