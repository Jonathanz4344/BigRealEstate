import { IconButtonVariant, Icons, TextInput } from "../../../components";
import { useSignupPage } from "../../../hooks";
import { CardPage } from "../components";

export const SignupPage = () => {
  const {
    state: {
      userName,
      setUserName,
      firstName,
      setFirstName,
      lastName,
      setLastName,
      email,
      setEmail,
      phone,
      setPhone,
      password,
      setPassword,
      rePassword,
      setRePassword,
      errors,
    },
    onCreateClick,
    onLoginClick,
  } = useSignupPage();

  return (
    <CardPage
      text={{
        pre: "Signup on ",
        highlight: "Zala CRM ",
        end: "to connect with leads for free! Today!",
      }}
      primaryBtn={{
        text: "Create Account",
        onClick: onCreateClick,
      }}
      secondaryBtn={{
        text: {
          pre: "Have an account allready?",
          highlight: "Login",
          end: " now!",
        },
        onClick: onLoginClick,
      }}
    >
      <div className="w-[75%] grow-1 flex items-center">
        <div className="w-full space-y-[15px]">
          <TextInput
            label="User name"
            value={userName}
            setValue={setUserName}
            icon={Icons.User}
            iconVariant={IconButtonVariant.Clear}
            flatIcon
            errorMsg={errors["userName"]}
          />

          <TextInput
            label="Email"
            value={email}
            setValue={setEmail}
            icon={Icons.Mail}
            iconVariant={IconButtonVariant.Clear}
            flatIcon
            errorMsg={errors["email"]}
          />

          <div className="w-full flex flex-row space-x-[15px]">
            <div className="flex-1 space-y-[15px]">
              <TextInput
                label="First name"
                value={firstName}
                setValue={setFirstName}
                icon={Icons.User}
                iconVariant={IconButtonVariant.Clear}
                flatIcon
                errorMsg={errors["firstName"]}
              />
              <TextInput
                label="Phone #"
                value={phone}
                setValue={setPhone}
                icon={Icons.Phone}
                iconVariant={IconButtonVariant.Clear}
                flatIcon
                errorMsg={errors["phone"]}
              />
            </div>
            <div className="flex-1">
              <TextInput
                label="Last name"
                value={lastName}
                setValue={setLastName}
                icon={Icons.User}
                iconVariant={IconButtonVariant.Clear}
                flatIcon
                errorMsg={errors["lastName"]}
              />
            </div>
          </div>

          <div className="w-full flex flex-row space-x-[15px]">
            <div className="flex-1 space-y-[15px]">
              <TextInput
                label="Password"
                value={password}
                setValue={setPassword}
                icon={Icons.Lock}
                iconVariant={IconButtonVariant.Clear}
                flatIcon
                errorMsg={errors["password"] || errors["passwordEquals"]}
              />
            </div>
            <div className="flex-1">
              <TextInput
                label="Repeat password"
                value={rePassword}
                setValue={setRePassword}
                icon={Icons.Lock}
                iconVariant={IconButtonVariant.Clear}
                flatIcon
                errorMsg={errors["rePassword"] || errors["passwordEquals"]}
              />
            </div>
          </div>
        </div>
        {/* <Snackbar open={} /> */}
      </div>
    </CardPage>
  );
};
