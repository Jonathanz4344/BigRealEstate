import type { IHighlightComponentDims } from "./types";
import { useDimensions } from "./useDimensions";

export const useLeadSearchHighlightComponents = () => {
  const [leadCardRef, leadCardDims, __setLeadCardDims, leadCardCount] =
    useDimensions();
  const [
    campaignTitleRef,
    campaignTitleDims,
    __setCampaignTitleDims,
    campaignTitleCount,
  ] = useDimensions();

  const highlightComponentDims: (IHighlightComponentDims | null)[] = [
    null,
    { ref: leadCardRef, dims: leadCardDims },
    { ref: campaignTitleRef, dims: campaignTitleDims },
  ];

  const highlightComponentDimsChange = [0, leadCardCount, campaignTitleCount];

  return {
    refs: {
      leadCardRef,
      campaignTitleRef,
    },
    highlightComponentDims,
    highlightComponentDimsChange,
  };
};
