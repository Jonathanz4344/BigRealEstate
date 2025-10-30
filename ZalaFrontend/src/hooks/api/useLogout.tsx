import { useAuthStore } from "../../stores";
import { useCookies } from "react-cookie";

export const useLogout = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const [_cookies, setCookie] = useCookies(["userId"], {
    doNotParse: true,
  });

  const onLogout = () => {
    setCookie("userId", undefined);
    setUser(undefined);
  };

  return onLogout;
};
