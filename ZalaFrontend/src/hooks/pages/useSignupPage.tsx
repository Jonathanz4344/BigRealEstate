import { useEffect } from "react";
import { useAppNavigation, useSignupState } from "../utils";
import { useAuthStore } from "../../stores";
import {
  AContactToIContact,
  AUserToIUser,
  type IContact,
} from "../../interfaces";
import { useApi } from "../api";
import { stringify } from "../../utils";
import { useSnackbar } from "notistack";
import { useCookies } from "react-cookie";

export const useSignupPage = () => {
  const setUser = useAuthStore((state) => state.setUser);

  const [_cookies, setCookie] = useCookies(["userId"], {
    doNotParse: true,
  });
  const snackbar = useSnackbar();

  const { toLoginPage } = useAppNavigation();
  const { createContact, createUser, linkContactToUser } = useApi();

  const state = useSignupState();
  const {
    userName,
    firstName,
    lastName,
    email,
    phone,
    password,
    rePassword,
    errors,
    setErrors,
  } = state;

  useEffect(() => {
    if (Object.keys(errors).length != 0) setErrors({});
  }, [userName, firstName, lastName, email, phone]);

  const isCreateAccountValid = (): [boolean, { [key: string]: string }] => {
    if (userName.trim().length === 0)
      return [false, { userName: "Missing user name" }];
    if (email.trim().length === 0) return [false, { email: "Missing email" }];
    if (firstName.trim().length === 0)
      return [false, { firstName: "Missing first name" }];
    if (lastName.trim().length === 0)
      return [false, { lastName: "Missing last name" }];
    if (phone.trim().length === 0) return [false, { phone: "Missing phone" }];
    if (password.trim().length === 0)
      return [false, { password: "Missing password" }];
    if (rePassword.trim().length === 0)
      return [false, { rePassword: "Missing repeat password" }];
    if (password !== rePassword)
      return [
        false,
        { passwordEquals: "Password and repeat password must be the same" },
      ];
    return [true, {}];
  };

  const onCreateClick = () => {
    const [isValid, errors] = isCreateAccountValid();
    setErrors(errors);
    if (!isValid) return;

    (async () => {
      const user = await signupV1({
        userName,
        email,
        firstName,
        lastName,
        phone,
        password,
      });
      if (!user) return;

      snackbar.enqueueSnackbar(
        `Account created! Hello, ${user?.contact?.firstName}`,
        { variant: "success" }
      );
      setCookie("userId", user.userId);
      setUser(user);
    })();
  };

  const showAPIError = (msg: string) =>
    snackbar.enqueueSnackbar(msg, { variant: "error" });

  const signupV1 = async (
    body: Omit<IContact, "contactId"> & { userName: string; password: string }
  ) => {
    const contactRes = await createContact({
      email: body.email,
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
    });

    if (contactRes.err || !contactRes.data) {
      console.log(`Internal error - Contact: ${contactRes}`);
      console.log(``);
      showAPIError("Internal error - please try again later");
      return;
    }

    const contact = AContactToIContact(contactRes.data);
    const blankUserRes = await createUser({
      username: body.userName,
      password: body.password,
      profile_pic: "",
      role: "user",
    });

    if (blankUserRes.err || !blankUserRes.data) {
      console.log(`Internal error - User: ${blankUserRes}`);
      console.log(``);
      showAPIError("Internal error - please try again later");
      return;
    }

    const userRes = await linkContactToUser({
      contactId: contact.contactId,
      userId: blankUserRes.data.user_id,
    });

    if (userRes.err || !userRes.data) {
      console.log(`Internal error - Connection: ${userRes}`);
      console.log(``);
      showAPIError("Internal error - please try again later");
      return;
    }

    const user = AUserToIUser(userRes.data);
    console.log(`Signed In User:`);
    console.log(stringify(user));
    console.log(``);
    return user;
  };

  const onLoginClick = () => {
    toLoginPage();
  };

  return {
    state,

    onCreateClick,
    onLoginClick,
  };
};
