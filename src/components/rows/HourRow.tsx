import clsx from "clsx";

type HourRowProps = {
  isHeader?: boolean;
  slots: string[];
  noCenterIndexs?: number[];
};

export const HourRow = ({
  isHeader = false,
  slots,
  noCenterIndexs = [],
}: HourRowProps) => {
  return (
    <div className="gradient-background round w-full flex flex-row gap-0">
      {slots.map((slot, index) => (
        <div
          key={index}
          className={clsx(
            "flex-1 flex items-center px-2",
            !isHeader && !noCenterIndexs.includes(index) && "justify-center"
          )}
        >
          <p
            className={clsx(
              isHeader && "font-bold text-2xl",
              !isHeader && "text-lg"
            )}
          >
            {slot}
          </p>
        </div>
      ))}
    </div>
  );
};
