import Portal from "@mui/material/Portal";
import type { PropsWithChildren } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
};

export const Modal = ({
  open,
  onClose,
  children,
}: PropsWithChildren<ModalProps>) => {
  return (
    open && (
      <Portal>
        <div
          onClick={onClose}
          className="full bg-secondary-50 z-10 fixed top-0 left-0 p-[60px]"
        >
          <div className="full relative">
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="absolute-fill z-[12] pointer-events-auto flex items-center justify-center"
            >
              <div className="h-full min-w-[50vw] card-base box-shadow p-5">
                {children}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    )
  );
};
