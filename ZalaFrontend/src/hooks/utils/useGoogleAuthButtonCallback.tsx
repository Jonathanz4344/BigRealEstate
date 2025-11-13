import { useSnack } from "./useSnack";
import { useAuthUser } from "./useAuthUser";
import type { IUser } from "../../interfaces";
import type { UseGoogleAuthButtonCallbackProps } from "../components";

export const useGoogleAuthButtonCallback = ({
  onMsg,
  onSuccess = () => {},
}: {
  onMsg: (user: IUser) => string;
  onSuccess?: () => void;
}) => {
  const loginUser = useAuthUser();
  const [successMsg, errorMsg] = useSnack();
  const callback = ({ error, user }: UseGoogleAuthButtonCallbackProps) => {
    if (error) {
      errorMsg(error);
    }

    if (user) {
      successMsg(onMsg(user));
      loginUser(user);
      onSuccess();
    }
  };
  return callback;
};
