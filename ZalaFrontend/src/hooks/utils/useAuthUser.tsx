import type { IUser } from "../../interfaces";
import { useAuthStore } from "../../stores";
import { useCookies } from "react-cookie";

export const useAuthUser = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const [_cookies, setCookie] = useCookies(["userId"], {
    doNotParse: true,
  });
  const authUser = (user: IUser) => {
    setCookie("userId", user.userId);
    setUser(user);
  };
  return authUser;
};
