import { useEffect, useState } from "react";
import { AUserToIUser } from "../../interfaces";
import { useApi } from "../api";
import {
  useAppNavigation,
  useAuthUser,
  useErrors,
  useGoogleAuthButtonCallback,
  useSnack,
  type IError,
} from "../utils";

export const useLoginPage = () => {
  const { toSignupPage } = useAppNavigation();
  const { loginAPI } = useApi();
  const loginUser = useAuthUser();
  const [successMsg, errorMsg] = useSnack();
  const googleAuthCallback = useGoogleAuthButtonCallback({
    onMsg: (user) => `Login success! Hello, ${user?.contact?.firstName}`,
  });

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

      successMsg(`Login success! Hello, ${user?.contact?.firstName}`);
      loginUser(user);
    })();
  };

  const loginV1 = async () => {
    const loginRes = await loginAPI({ username: userName, password });

    if (loginRes.err || !loginRes.data) {
      console.log(`Internal Error - Login: ${loginRes.err}`);
      console.log(``);
      errorMsg("Internal error - please try again later");
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
    googleAuthCallback,
  };
};
