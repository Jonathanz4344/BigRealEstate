import { IconButtonVariant, Icons, TextInput } from "../../../components";
import { useLoginPage } from "../../../hooks";
import { CardPage } from "../components";
import transition from "../../../utils/transitions/transition";

export const LoginPage = transition(() => {
  const {
    state: { userName, setUserName, password, setPassword, errors },
    onLoginClick,
    onSignupClick,
    googleAuthCallback,
  } = useLoginPage();

  return (
    <CardPage
      text={{
        pre: "Login to ",
        highlight: "ZLA CRM ",
        end: "to connect with leads!",
      }}
      primaryBtn={{
        text: "Login",
        onClick: onLoginClick,
      }}
      secondaryBtn={{
        text: {
          pre: "Dont have an account? ",
          highlight: "Create an account",
          end: " now!",
        },
        onClick: onSignupClick,
      }}
      googleCallback={googleAuthCallback}
    >
      <div className="w-[75%] grow flex items-center">
        <div className="w-full space-y-3.75">
          <TextInput
            label="Username"
            value={userName}
            setValue={setUserName}
            icon={Icons.User}
            iconVariant={IconButtonVariant.Clear}
            flatIcon
            errorMsg={errors["userName"]}
          />

          <TextInput
            secure
            label="Password"
            value={password}
            setValue={setPassword}
            icon={Icons.Lock}
            iconVariant={IconButtonVariant.Clear}
            flatIcon
            errorMsg={errors["password"]}
          />
        </div>
      </div>
    </CardPage>
  );
});
