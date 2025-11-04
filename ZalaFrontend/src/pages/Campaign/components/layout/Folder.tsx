import clsx from "clsx";
import { Icon, type IconProps } from "../../../../components";
import { COLORS } from "../../../../config";
import type { PropsWithChildren } from "react";

type FolderProps = {
  title?: string;
  icons?: IconProps[];
  footer?: React.ReactNode;
};

export const Folder = ({
  title,
  icons = [],
  children,
  footer,
}: PropsWithChildren<FolderProps>) => {
  return (
    <div className="w-full h-full flex flex-col items-start justify-center">
      <div
        className={clsx(
          "bg-primary relative z-1 box-shadow rounded-[15px] rounded-bl-none rounded-br-none",
          "flex flex-row items-center justify-between p-[15px] space-x-[30px]"
        )}
      >
        {icons.map((props) => (
          <Icon
            hoverColor={COLORS.accent}
            {...props}
            className={clsx("cursor-pointer", props.className)}
          />
        ))}
      </div>
      <div
        className={clsx(
          "h-full w-full grow-1 box-shadow rounded-[15px] rounded-tl-none",
          "relative"
        )}
      >
        <div className="bg-primary z-1 absolute top-0 left-0 bottom-0 right-0 rounded-[15px] rounded-tl-none">
          <div className="flex flex-col relative w-full h-full">
            {title && (
              <div className="w-full flex items-center justify-center pt-[30px]">
                <p className="font-bold text-3xl">{title}</p>
              </div>
            )}
            <div className="w-full grow-1 max-h-full">{children}</div>
            {footer && <div className="w-full">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
