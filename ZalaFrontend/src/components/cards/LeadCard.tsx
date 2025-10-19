import clsx from "clsx";
import type { DemoData } from "../../interfaces";
import { IMAGES_ARR } from "../../assets";
import { Button } from "../buttons";
import { Icons } from "../icons";
import { ButtonVariant } from "../buttons/ButtonVariant";

type LeadCardButton = {
  text: string;
  icon?: Icons;
  onClick?: () => void;
};

type LeadCardProps = {
  lead: DemoData;
  i: number;
  active?: boolean;
  button?: LeadCardButton;
  onTitleClick?: () => void;
};

export const LeadCard = ({
  lead,
  button,
  active,
  i,
  onTitleClick,
}: LeadCardProps) => {
  return (
    <div
      className={clsx(
        "card-base box-shadow flex flex-row p-[15px]",
        active ? "border-4 border-accent" : ""
      )}
    >
      <div className="w-[40%] mr-[15px]">
        <img
          className="w-full h-full rounded-[15px]"
          src={IMAGES_ARR[i % IMAGES_ARR.length]}
        />
      </div>
      <div className="w-[60%] flex flex-col justify-between">
        <div className="mb-[15px] flex flex-col">
          <span
            onClick={onTitleClick}
            className={clsx(
              "overflow-ellipsis line-clamp-1 font-bold text-base",
              onTitleClick ? "cursor-pointer underline hover:text-accent" : "",
              active ? "text-accent" : ""
            )}
          >
            {lead.agent}
          </span>
          <span className="overflow-ellipsis line-clamp-2 text-sm text-secondary-50">
            {lead.address}
          </span>
          <span className="overflow-ellipsis line-clamp-1 text-sm  text-secondary-50">
            {lead.contact}
          </span>
        </div>

        {button && (
          <Button
            text={button.text}
            icon={button.icon}
            variant={ButtonVariant.Tertiary}
            activeVariant={ButtonVariant.Primary}
            onClick={button.onClick}
          />
        )}
      </div>
    </div>
  );
};
