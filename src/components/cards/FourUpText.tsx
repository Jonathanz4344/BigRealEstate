import type { IFourUpItem } from "../../interfaces";

type FourUpTextProps = {
  item: IFourUpItem;
};

// Component for individual items
export const FourUpText = ({ item }: FourUpTextProps) => {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="text-white font-medium min-w-16">{item.title}:</div>
      <div className="flex-1 text-white text-sm leading-relaxed">
        {item.content}
      </div>
    </div>
  );
};
