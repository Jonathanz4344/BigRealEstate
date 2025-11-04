import { useAuthStore } from "../../stores";
import { useCookies } from "react-cookie";
import { useAppNavigation } from "../utils";

export const useLogout = () => {
  const { toLoginPage } = useAppNavigation();
  const setUser = useAuthStore((state) => state.setUser);

  const [_cookies, setCookie] = useCookies(["userId"], {
    doNotParse: true,
  });

  const onLogout = () => {
    setCookie("userId", undefined);
    setUser(undefined);
    toLoginPage();
  };

  return onLogout;
};
