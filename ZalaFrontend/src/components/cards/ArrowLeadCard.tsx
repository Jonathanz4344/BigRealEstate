import clsx from "clsx";
import type { ILead } from "../../interfaces";
import { IMAGES_ARR } from "../../assets";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { useHover } from "../../hooks";

type ArrowLeadCardProps = {
  lead: ILead;
  i: number;
  border?: boolean;
  onClick?: () => void;
  onIconClick?: () => void;
};

export const ArrowLeadCard = ({
  lead,
  i,
  border = true,
  onClick,
  onIconClick,
}: ArrowLeadCardProps) => {
  const [cardHovered, cardHoverProps] = useHover();
  const [iconHovered, iconHoverProps] = useHover();
  const cardHoverActivatesIcon = onClick && !onIconClick;
  const iconHoveredAndIndependent = onIconClick && iconHovered;
  const cardActive = !iconHoveredAndIndependent && cardHovered && onClick;
  return (
    <div
      {...cardHoverProps}
      className={clsx(
        "flex flex-row space-x-[15px] pb-[30px]",
        border ? "border-b-2" : "",
        border ? (cardActive ? "border-accent" : "border-secondary") : "",
        onClick ? "cursor-pointer" : ""
      )}
      onClick={iconHoveredAndIndependent ? undefined : onClick}
    >
      <div className="w-[25%]">
        <img
          className="w-full h-full rounded-[15px]"
          src={IMAGES_ARR[i % IMAGES_ARR.length]}
        />
      </div>

      <div className="w-full flex flex-row space-x-[15px]">
        <div className="flex flex-col grow-1 space-y-[5px]">
          <p
            className={clsx(
              "overflow-ellipsis line-clamp-1 font-bold text-base",
              cardActive ? "text-accent" : "text-secondary"
            )}
          >
            {lead.contact.firstName} {lead.contact.lastName}
          </p>
          <span className="overflow-ellipsis line-clamp-2 text-base text-secondary-50">
            {lead.contact.email}
          </span>
          <span className="overflow-ellipsis line-clamp-1 text-base  text-secondary-50">
            {lead.contact.phone}
          </span>
          <span className="overflow-ellipsis line-clamp-2 text-base  text-secondary-50">
            {lead.notes}
          </span>
        </div>
        <div className="flex items-center justify-center">
          <div {...iconHoverProps}>
            <IconButton
              disableOpacity
              name={Icons.Chevron}
              variant={
                (cardHoverActivatesIcon && cardActive) || iconHovered
                  ? IconButtonVariant.Accent
                  : IconButtonVariant.Secondary
              }
              onClick={onIconClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
