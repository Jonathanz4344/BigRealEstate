import { useState } from "react";
import { useAuthStore } from "../../stores";
import { useApi } from "../api";
import { Normalizer } from "../../utils";
import type { ICampaign } from "../../interfaces";
import { useAppNavigation, useTimeoutEffect } from "../utils";

export const usePastCampaignsPage = () => {
  const user = useAuthStore((state) => state.user);

  const { getCampaigns: apiGetCampaigns, apiResponseError } = useApi();
  const { toCampaignPage } = useAppNavigation();

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  useTimeoutEffect(
    () => {
      getCampaigns();
    },
    [user?.userId],
    250
  );

  const getCampaigns = async () => {
    if (user?.userId === -1) return;

    setLoading(true);
    const res = await apiGetCampaigns();
    setLoading(false);

    if (res.err || !res.data)
      return apiResponseError("getting all campaigns", res.err);

    const userCampaigns = res.data
      .map(Normalizer.APINormalizer.campaign)
      .filter((campaign) => campaign.userId === user?.userId);
    setCampaigns(userCampaigns);
  };

  return {
    loading,
    campaigns,

    toCampaignPage,
  };
};
