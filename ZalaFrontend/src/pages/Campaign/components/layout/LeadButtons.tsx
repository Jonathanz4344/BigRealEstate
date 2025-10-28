import { Button, Icons } from "../../../../components";
import { ButtonVariant } from "../../../../components/buttons/ButtonVariant";

type LeadButtonsProps = {
  secondary?: {
    text: string;
    icon: Icons;
    onPress?: () => void;
    disabled?: boolean;
  };
  primary: {
    text: string;
    icon: Icons;
    onPress?: () => void;
    disabled?: boolean;
  };
};

export const LeadButtons = ({ primary, secondary }: LeadButtonsProps) => {
  return (
    <div className="flex flex-row space-x-[30px] items-center justify-center p-[30px] pt-[0px]">
      {secondary && (
        <div className="w-[300px]">
          <Button
            variant={ButtonVariant.Secondary}
            text={secondary.text}
            onClick={secondary.onPress}
            disabled={secondary.disabled}
            icon={secondary.icon}
          />
        </div>
      )}
      <div className="w-[300px]">
        <Button
          variant={ButtonVariant.Primary}
          text={primary.text}
          onClick={primary.onPress}
          disabled={primary.disabled}
          icon={primary.icon}
        />
      </div>
    </div>
  );
};
