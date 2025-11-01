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
        "relative flex items-start justify-start w-min translate-[-50%]",
        onClick ? "cursor-pointer" : "",
        active ? "z-1" : "z-0"
      )}
    >
      {children}
    </div>
  );
};
