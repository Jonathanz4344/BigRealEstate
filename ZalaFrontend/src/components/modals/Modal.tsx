import Portal from "@mui/material/Portal";
import type { PropsWithChildren } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
};

type ModalComponentProps = ModalProps & {
  width?: string;
  height?: string;
};

export const Modal = ({
  open,
  width = "75vw",
  height = "100%",
  onClose,
  children,
}: PropsWithChildren<ModalComponentProps>) => {
  return (
    open && (
      <Portal>
        <div
          onClick={onClose}
          className="full bg-secondary-50 z-10 fixed top-0 left-0 p-[60px]"
        >
          <div className="full relative">
            <div
              onClick={onClose}
              className="absolute-fill z-[12] pointer-events-auto flex items-center justify-center"
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="card-base box-shadow p-5"
                style={{
                  width,
                  maxWidth: width,
                  height,
                }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    )
  );
};
