import { COLORS } from "../../config";

export const Loader = () => (
  <div className="flex flex-col items-center justify-center space-y-3">
    <div
      className="h-12 w-12 rounded-full border-4 border-neutral-200 animate-spin"
      style={{ borderTopColor: COLORS.accent }}
    />
    <span className="text-sm font-medium text-white">Fetching leads…</span>
  </div>
);
