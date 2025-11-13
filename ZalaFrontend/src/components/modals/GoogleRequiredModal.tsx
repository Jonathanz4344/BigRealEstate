import { useGoogleAuthButtonCallback } from "../../hooks";
import { useAuthStore } from "../../stores";
import { GoogleAuthButton } from "../buttons";
import { Modal, type ModalProps } from "./Modal";

type GoogleRequiredModalProps = ModalProps & {};

export const GoogleRequiredModal = ({
  open,
  onClose,
}: GoogleRequiredModalProps) => {
  const user = useAuthStore((state) => state.user);
  const googleConnectCallback = useGoogleAuthButtonCallback({
    onMsg: () => "Google account connected!",
    onSuccess: onClose,
  });
  return (
    <Modal open={open} onClose={onClose} width="" height="">
      <div className="full p-6 flex flex-col justify-between">
        <div className="space-y-[5px] flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-secondary">
            GOOGLE WORKSPACE
          </h2>
          <p className="text-secondary-50 text-sm line-clamp-2">
            Connect your Google account
          </p>
          <p className="text-secondary text-base max-w-[25vw] text-center">
            Sign in with Google to enable Gmail sending from campaigns and test
            emails.
          </p>
          <GoogleAuthButton
            callback={googleConnectCallback}
            className="w-full cursor-pointer"
            getExtraPayload={() => ({ targetUserId: user!.userId })}
          />
        </div>
      </div>
    </Modal>
  );
};
