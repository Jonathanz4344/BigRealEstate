import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useAuthStore } from "../../stores";
import { useApi } from "../api";
import { AUserToIUser } from "../../interfaces";

export const useAutoLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const [cookies] = useCookies(["userId"], {
    doNotParse: true,
  });

  const { getUser } = useApi();

  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = () => {
    const userId = cookies.userId;

    if (!userId) return;

    (async () => {
      const user = await login(userId);
      if (!user) return;
      setUser(user);
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
