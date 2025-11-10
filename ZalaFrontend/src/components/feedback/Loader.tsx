import clsx from "clsx";
import { COLORS } from "../../config";

type LoaderProps = {
  darkMode?: boolean;
};

export const Loader = ({ darkMode }: LoaderProps) => (
  <div className="flex flex-col items-center justify-center space-y-3">
    <div
      className={clsx(
        "h-12 w-12 rounded-full border-4 animate-spin",
        darkMode ? "border-accent" : "border-white"
      )}
      style={{ borderTopColor: darkMode ? COLORS.white : COLORS.accent }}
    />
    <span
      className={clsx(
        "text-sm font-medium ",
        darkMode ? "text-secondary" : "text-white"
      )}
    >
      Fetching leads…
    </span>
  </div>
);
