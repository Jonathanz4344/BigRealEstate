import { type PropsWithChildren } from "react";
import {
  Button,
  ButtonVariant,
  GoogleAuthButton,
  type GoogleAuthButtonCallback,
} from "../../../../components";
import { IMAGES } from "../../../../assets";

type HighlightText = {
  pre: string;
  highlight: string;
  end: string;
};

type CardPageProps = {
  text: HighlightText;
  primaryBtn: {
    text: string;
    onClick: () => void;
  };
  secondaryBtn: {
    text: HighlightText;
    onClick: () => void;
  };
  googleCallback: GoogleAuthButtonCallback;
};

export const CardPage = ({
  text,
  primaryBtn,
  secondaryBtn,
  children,
  googleCallback,
}: PropsWithChildren<CardPageProps>) => {
  return (
    <div className="flex flex-1 items-center justify-center py-15">
      <form
        className="card-base box-shadow w-[75%] h-full p-7.5 space-y-7.5 flex flex-col items-center space"
        onSubmit={(e) => {
          e.preventDefault();
          primaryBtn.onClick();
        }}
      >
        <div className="flex flex-col items-center space-y-1.25">
          <img src={IMAGES.ZalaBlackLogo} width={200} height={200} />
          <p className="text-base text-secondary-50">
            {text.pre}
            <span className="text-xl font-bold text-secondary">
              {text.highlight}
            </span>
            {text.end}
          </p>
        </div>
        {children}
        <div className="w-full flex flex-col items-center text-secondary-50 text-base space-y-2.5">
          <div className="w-full flex flex-col items-center space-y-1.25">
            <div className="w-75">
              <Button
                text={primaryBtn.text}
                variant={ButtonVariant.Primary}
                onClick={primaryBtn.onClick}
              />
            </div>
            <p className="text-sm">or</p>
            <div className="w-62.5">
              <GoogleAuthButton callback={googleCallback} />
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            <p className="text-center">
              {secondaryBtn.text.pre}
              <span
                className={
                  "text-accent cursor-pointer underline hover:font-bold"
                }
                onClick={secondaryBtn.onClick}
              >
                {secondaryBtn.text.highlight}
              </span>
              {secondaryBtn.text.end}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
