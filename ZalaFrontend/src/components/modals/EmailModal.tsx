import { Modal, type ModalProps } from "./Modal";

type EmailModalProps = ModalProps & {};

export const EmailModal = ({ open, onClose }: EmailModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="w-full h-full"></div>
    </Modal>
  );
};
