import { type PropsWithChildren } from "react";
import {
  Button,
  ButtonVariant,
  GoogleAuthButton,
  type GoogleAuthButtonCallback,
} from "../../../../components";

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
    <div className="flex flex-1 items-center justify-center py-[60px]">
      <div className="card-base box-shadow w-[75%] h-full p-[30px] space-y-[30px] flex flex-col items-center space">
        <div className="flex flex-col items-center space-y-[5px]">
          <p className="text-5xl font-bold">Zala</p>
          <p className="text-base text-secondary-50">
            {text.pre}
            <span className="text-xl font-bold text-secondary">
              {text.highlight}
            </span>
            {text.end}
          </p>
        </div>
        {children}
        <div className="w-full flex flex-col items-center text-secondary-50 text-base space-y-[10px]">
          <div className="w-full flex flex-col items-center space-y-[5px]">
            <div className="w-[300px]">
              <Button
                text={primaryBtn.text}
                variant={ButtonVariant.Primary}
                onClick={primaryBtn.onClick}
              />
            </div>
            <p className="text-sm">or</p>
            <div className="w-[250px]">
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

          {/* <div>
            <p className="mt-[10px]">or</p>
            <p className="text-center">
              {secondaryBtn.text.pre}
              <br />
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
          </div> */}
        </div>
      </div>
    </div>
  );
};
