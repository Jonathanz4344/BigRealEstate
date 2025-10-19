import clsx from "clsx";

type LabelProps = {
  label: string;
  active?: boolean;
};

export const Label = ({ label, active }: LabelProps) => {
  return (
    <div
      className={clsx(
        "absolute top-0 left-0 px-2.5",
        "flex  h-full pointer-events-none text-xl",
        "transition-all duration-150",
        "peer-focus:scale-[.75] peer-focus:top-[-50%]",
        active ? "scale-[.75] top-[-50%]" : ""
      )}
    >
      <div className="relative flex flex-1 h-full items-center ">
        <div className="absolute z-0 top-0 left-0 bottom-0 right-0 flex items-center ">
          <div className="bg-white w-full h-[8px]" />
        </div>
        <span className="z-1">{label}</span>
      </div>
    </div>
  );
};
