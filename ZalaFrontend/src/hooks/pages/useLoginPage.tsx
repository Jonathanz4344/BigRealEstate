import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { AUserToIUser } from "../../interfaces";
import { useAuthStore } from "../../stores";
import { useApi } from "../api";
import { useAppNavigation, useErrors, type IError } from "../utils";
import { useCookies } from "react-cookie";

export const useLoginPage = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const [_cookies, setCookie] = useCookies(["userId"], {
    doNotParse: true,
  });
  const snackbar = useSnackbar();

  const { toSignupPage } = useAppNavigation();
  const { loginAPI } = useApi();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useErrors();

  useEffect(() => {
    if (Object.keys(errors).length > 0) setErrors({});
  }, [userName, password]);

  const isLoginValid = (): [boolean, IError] => {
    if (userName.length === 0)
      return [false, { userName: "Missing user name" }];
    if (password.length === 0) return [false, { password: "Missing password" }];
    return [true, {}];
  };

  const onLoginClick = () => {
    const [isValid, errors] = isLoginValid();
    setErrors(errors);
    if (!isValid) return;

    (async () => {
      const user = await loginV1();
      if (!user) return;

      snackbar.enqueueSnackbar(
        `Loggin success! Hello, ${user?.contact?.firstName}`,
        { variant: "success" }
      );
      setCookie("userId", user.userId);
      setUser(user);
    })();
  };

  const showAPIError = (msg: string) =>
    snackbar.enqueueSnackbar(msg, { variant: "error" });

  const loginV1 = async () => {
    const loginRes = await loginAPI({ username: userName, password });

    if (loginRes.err || !loginRes.data) {
      console.log(`Internal Error - Login: ${loginRes.err}`);
      console.log(``);
      showAPIError("Internal error - please try again later");
      return;
    }

    const user = AUserToIUser(loginRes.data);
    return user;
  };

  const onSignupClick = () => {
    toSignupPage();
  };

  return {
    state: {
      userName,
      setUserName,
      password,
      setPassword,
      errors,
    },
    onLoginClick,
    onSignupClick,
  };
};
