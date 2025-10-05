import SouthIcon from "@mui/icons-material/South";
import clsx from "clsx";

type ScrollDownIndicatorProps = {
  top?: boolean;
};

export const ScrollDownIndicator = ({
  top = true,
}: ScrollDownIndicatorProps) => {
  return (
    <div
      className={clsx(
        "bg-[#00000050] w-[150px] h-[150px] text-white p-5 flex items-center justify-center rounded-full"
      )}
    >
      {top && <SouthIcon className="text-6xl!" />}
    </div>
  );
};
