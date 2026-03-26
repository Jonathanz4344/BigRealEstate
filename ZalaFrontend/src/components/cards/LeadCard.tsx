import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { ILead, ISourceResult } from "../../interfaces";
import { IMAGES_ARR } from "../../assets";
import { Button } from "../buttons";
import { Icons } from "../icons";
import { ButtonVariant } from "../buttons/ButtonVariant";
import { CardVariant } from "./types";
import { useHover } from "../../hooks";

type LeadCardButton = {
  text: string;
  icon?: Icons;
  onClick?: () => void;
};

export type LeadCardProps = {
  lead: ILead;
  variant?: CardVariant;
  sourceResult?: ISourceResult<unknown>;
  i: number;
  active?: boolean;
  button?: LeadCardButton;
  onClick?: () => void;
  onTitleClick?: () => void;
};

export const LeadCard = ({
  lead,
  variant = CardVariant.Primary,
  // sourceResult,
  button,
  active,
  i,
  onClick,
  onTitleClick,
}: LeadCardProps) => {
  const [isHovered, hoverProps] = useHover();
  const isSecondVariant = variant === CardVariant.Secondary;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [active]);

  return (
    <div
      ref={cardRef}
      {...hoverProps}
      className={clsx(
        "card-base box-shadow flex flex-row p-3.75",
        active ? "border-4 border-accent" : "",
        isSecondVariant ? "bg-white!" : "",
        onClick && isHovered
          ? "-translate-y-1.25 transition-[translate] duration-75 cursor-pointer"
          : "",
      )}
      onClick={onClick}
    >
      <div className="w-[40%] mr-3.75">
        <img
          className="w-full h-full rounded-3.75"
          src={IMAGES_ARR[i % IMAGES_ARR.length]}
        />
      </div>
      <div className="w-[60%] flex flex-col justify-between">
        <div className="mb-3.75 flex flex-col">
          <span
            onClick={onTitleClick}
            className={clsx(
              "overflow-ellipsis line-clamp-1 font-bold text-base",
              onTitleClick ? "cursor-pointer underline hover:text-accent" : "",
              active ? "text-accent" : "",
            )}
          >
            {lead.contact?.firstName} {lead.contact?.lastName}
          </span>
          <span className="overflow-ellipsis line-clamp-2 text-sm text-secondary-50">
            {lead.contact?.email}
          </span>
          <span className="overflow-ellipsis line-clamp-1 text-sm  text-secondary-50">
            {lead.contact?.phone}
          </span>
          <span className="overflow-ellipsis line-clamp-2 text-sm  text-secondary-50">
            {lead.notes}
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
