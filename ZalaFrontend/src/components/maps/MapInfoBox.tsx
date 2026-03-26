import { Icon, Icons } from "../icons";

export type MapPinInfo = {
  type: "Lead" | "Property";
  title: string;
  subtitle?: string;
  address?: string;
};

type MapInfoBoxProps = {
  info: MapPinInfo;
  onClose: () => void;
};

export const MapInfoBox = ({ info, onClose }: MapInfoBoxProps) => {
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#1e1e2f] border border-white/10 rounded-lg shadow-xl min-w-[200px] max-w-[280px] overflow-hidden">
        {/* Header with type badge and close button */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              info.type === "Lead"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-cyan-500/20 text-cyan-400"
            }`}
          >
            {info.type}
          </span>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors cursor-pointer ml-2"
          >
            <Icon name={Icons.Close} scale={0.8} color="currentColor" />
          </button>
        </div>

        {/* Content */}
        <div className="px-3 py-2">
          <p className="text-white text-sm font-medium leading-tight truncate">
            {info.title}
          </p>
          {info.subtitle && (
            <p className="text-white/60 text-xs mt-0.5 truncate">
              {info.subtitle}
            </p>
          )}
          {info.address && (
            <p className="text-white/40 text-xs mt-1 leading-snug">
              {info.address}
            </p>
          )}
        </div>
      </div>

      {/* Arrow pointing down */}
      <div className="flex justify-center">
        <div className="w-3 h-3 bg-[#1e1e2f] border-r border-b border-white/10 rotate-45 -mt-1.5" />
      </div>
    </div>
  );
};
