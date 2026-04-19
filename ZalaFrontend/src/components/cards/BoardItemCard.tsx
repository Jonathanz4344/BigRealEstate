import { useCallback } from "react";
import type { ILead, IPropertyCard } from "../../interfaces";
import clsx from "clsx";
import { resolveAssetUrl } from "../../utils";
import { useHover } from "../../hooks";
import { ImageCard } from "./ImageCard";

type BoardItemType = "lead" | "property";

export type DraggableBoardItemData = {
  cardId: number;
  fromStepId: number;
  cardType: BoardItemType;
};

type BoardItemCardProps = {
  type: BoardItemType;
  stepId: number;
  selected?: boolean;
  expanded?: boolean;
  leadInfo?: ILead;
  propertyInfo?: IPropertyCard;
  onClick?: () => void;
};

export const BoardItemCard = ({
  type,
  stepId,
  expanded,
  leadInfo,
  selected,
  propertyInfo,
  onClick,
}: BoardItemCardProps) => {
  const [isHovered, hoverProps] = useHover();

  const title = leadInfo
    ? leadInfo.buisness.length > 0
      ? leadInfo.buisness
      : leadInfo.contact
        ? `${leadInfo.contact.firstName} ${leadInfo.contact.lastName}`.trim()
        : "Unnamed lead"
    : propertyInfo?.propertyName;
  const subtitle = leadInfo ? leadInfo.notes : propertyInfo?.notes;

  const images = leadInfo?.images ?? propertyInfo?.images ?? [];
  const showingImage = images.length > 0 ? images[0] : undefined;
  const toUrl = useCallback((url: string) => resolveAssetUrl(url), []);

  return expanded ? (
    <div
      {...hoverProps}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "card",
          JSON.stringify({
            cardId: leadInfo?.leadId ?? propertyInfo?.propertyId,
            fromStepId: stepId,
            cardType: type,
          }),
        );
      }}
      className={clsx(
        "full card-base overflow-hidden",
        "w-full p-[10px] space-y-[5px]",
        isHovered
          ? "-translate-y-[5px] transition-transform duration-75 cursor-pointer"
          : "",
        onClick ? "active:scale-[.95]" : "",
      )}
      onClick={onClick}
    >
      <div className={clsx("h-[225px] rounded-[15px] overflow-hidden")}>
        <ImageCard
          src={showingImage ? toUrl(showingImage.imageUrl) : undefined}
          alt={showingImage?.caption}
        />
      </div>

      <div className="flex flex-col">
        <span
          className={clsx(
            "text-lg",
            selected ? "text-accent" : "text-secondary",
          )}
        >
          {title}
        </span>
        <span className="text-sm text-secondary-50">{subtitle}</span>
      </div>
    </div>
  ) : (
    <div
      style={{ width: "100%", height: 30 }}
      className={clsx("bg-white rounded-[5px]")}
    ></div>
  );
};
