import { IconButtonVariant, Icons, TextInput } from "../../../components";
import { useLoginPage } from "../../../hooks";
import { CardPage } from "../components";

export const LoginPage = () => {
  const {
    state: { userName, setUserName, password, setPassword, errors },
    onLoginClick,
    onSignupClick,
  } = useLoginPage();

  return (
    <CardPage
      text={{
        pre: "Login to ",
        highlight: "Zala CRM ",
        end: "to connect with leads!",
      }}
      primaryBtn={{
        text: "Login",
        onClick: onLoginClick,
      }}
      secondaryBtn={{
        text: {
          pre: "Dont have an account?",
          highlight: "Create an account",
          end: " now!",
        },
        onClick: onSignupClick,
      }}
    >
      <div className="w-[75%] grow-1 flex items-center">
        <div className="w-full space-y-[15px]">
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
};
