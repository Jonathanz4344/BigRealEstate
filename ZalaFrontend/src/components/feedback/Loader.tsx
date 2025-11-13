import clsx from "clsx";
import { COLORS } from "../../config";

type LoaderProps = {
  darkMode?: boolean;
  text?: string;
};

export const Loader = ({
  darkMode,
  text = "Fetching leads...",
}: LoaderProps) => (
  <div className="flex flex-col items-center justify-center space-y-3">
    <div
      className={clsx(
        "h-12 w-12 rounded-full border-4 animate-spin",
        darkMode ? "border-accent" : "border-white"
      )}
      style={{ borderTopColor: darkMode ? COLORS.white : COLORS.accent }}
    />
    {text && (
      <span
        className={clsx(
          "text-sm font-medium ",
          darkMode ? "text-secondary" : "text-white"
        )}
      >
        {text}
      </span>
    )}
  </div>
);
