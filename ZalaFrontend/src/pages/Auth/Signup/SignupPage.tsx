import { IconButtonVariant, Icons, TextInput } from "../../../components";
import { useSignupPage } from "../../../hooks";
import { CardPage } from "../components";
import transition from "../../../utils/transitions/transition";

export const SignupPage = transition(() => {
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
      verificationStep,
      verificationCode,
      setVerificationCode,
      sendingCode,
      verifyingCode,
    },
    onCreateClick,
    onLoginClick,
    onVerifyCode,
    onResendCode,
    googleAuthCallback,
  } = useSignupPage();

  return (
    <CardPage
      text={{
        pre: "Signup on ",
        highlight: "ZLA CRM ",
        end: "to connect with leads for free! Today!",
      }}
      primaryBtn={{
        text: verificationStep
          ? verifyingCode
            ? "Verifying..."
            : "Verify Code"
          : sendingCode
            ? "Sending Code..."
            : "Create Account",
        onClick: verificationStep ? onVerifyCode : onCreateClick,
      }}
      secondaryBtn={{
        text: {
          pre: "Have an account allready? ",
          highlight: "Login",
          end: " now!",
        },
        onClick: onLoginClick,
      }}
      googleCallback={googleAuthCallback}
    >
      <div className="w-[75%] grow-1 flex items-center">
        <div className="w-full space-y-[15px]">
          {!verificationStep ? (
            <>
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
                    secure
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
                    secure
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
            </>
          ) : (
            <div className="flex flex-col items-center space-y-[20px]">
              <div className="text-center space-y-[8px]">
                <p className="text-lg font-semibold text-secondary">
                  Check your email
                </p>
                <p className="text-sm text-secondary-50">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold">{email}</span>
                </p>
              </div>

              <div className="w-[250px]">
                <TextInput
                  label="Verification Code"
                  value={verificationCode}
                  setValue={setVerificationCode}
                  icon={Icons.Mail}
                  iconVariant={IconButtonVariant.Clear}
                  flatIcon
                  errorMsg={errors["verificationCode"]}
                />
              </div>

              <p
                className="text-sm text-accent cursor-pointer underline hover:font-bold"
                onClick={onResendCode}
              >
                Didn't get the code? Resend
              </p>
            </div>
          )}
        </div>
      </div>
    </CardPage>
  );
});
