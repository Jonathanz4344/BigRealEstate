import { useCookies } from "react-cookie";
import { useAuthStore } from "../../stores";
import { useApi } from "../api";
import { AUserToIUser, type IUser } from "../../interfaces";
import { useAppNavigation, useTimeoutEffect } from "../utils";

export const useAutoLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const { toLoginPage } = useAppNavigation();
  const [cookies, setCookies] = useCookies(["userId"], {
    doNotParse: true,
  });

  const { getUser } = useApi();

  useTimeoutEffect(
    () => {
      autoLogin();
    },
    [],
    75
  );

  const onUserFound = (user: IUser) => {
    setUser(user);
  };

  const onUserNotFound = () => {
    setCookies("userId", undefined);
    toLoginPage();
  };

  const autoLogin = () => {
    const userId = cookies.userId;

    if (!userId || userId === "undefined") return;

    (async () => {
      const user = await login(userId);
      if (!user) return onUserNotFound();
      onUserFound(user);
    })();
  };

  const login = async (userId: string) => {
    const userRes = await getUser(userId);

    if (userRes.err || !userRes.data) {
      console.log(`Internal error - Autologin: ${userRes.err}`);
      console.log(``);
      return;
    }

    const user = AUserToIUser(userRes.data);
    return user;
  };
};
