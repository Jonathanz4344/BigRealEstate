import clsx from "clsx";
import { type PropsWithChildren } from "react";

type MapElementProps = {
  lat: number;
  lng: number;
  active?: boolean;
  onClick?: () => void;
};

export const MapElement = ({
  children,
  active,
  onClick,
}: PropsWithChildren<MapElementProps>) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "relative flex flex-col items-center justify-end w-min translate-[-50%] overflow-visible",
        onClick ? "cursor-pointer" : "",
        active ? "z-10" : "z-0"
      )}
    >
      {children}
    </div>
  );
};
