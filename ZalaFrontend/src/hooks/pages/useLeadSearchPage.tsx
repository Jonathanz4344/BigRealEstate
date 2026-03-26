import { produce } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAuthStore,
  useCampaignStore,
  useSearchFilterStore,
  useSearchQueryStore,
  useSideNavControlStore,
} from "../../stores";
import { Normalizer, stringify } from "../../utils";
import type { MapRefHandle } from "../components";
import { useAppNavigation, useSnack } from "../utils";
import { useAlterUserXp, useApi } from "../api";

export const useLeadSearchPage = () => {
  const user = useAuthStore((state) => state.user);
  const leadData = useSearchQueryStore((state) => state.data);
  const nearbyProperties = useSearchQueryStore(
    (state) => state.nearbyProperties,
  );
  const setCampaign = useCampaignStore((state) => state.setCampaign);
  const sortBy = useSearchFilterStore((state) => state.sortBy);
  const openSideNav = useSideNavControlStore((state) => state.open);

  const setNearbyProperties = useSearchQueryStore(
    (state) => state.setNearbyProperties,
  );

  const { createCampaign, getUserProperties } = useApi();
  const [successSnack, errorSnack] = useSnack();
  const { toCampaignPage } = useAppNavigation();

  const alterUserXP = useAlterUserXp();

  const mapRef = useRef<MapRefHandle>(null);

  const [activeLead, setActiveLead] = useState<number>(-1);
  const [campaignLeads, setCampaignLeads] = useState<number[]>([]);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user properties on mount so they always appear on the map
  useEffect(() => {
    if (!user) return;
    getUserProperties({ userId: user.userId }).then((res) => {
      if (res.err || !res.data) return;
      const props = res.data
        .filter((p) => p.address && p.address.lat && p.address.long)
        .map((p) => ({
          propertyId: p.property_id,
          propertyName: p.property_name ?? "",
          address: {
            lat: p.address.lat,
            long: p.address.long,
            street1: p.address.street_1 ?? "",
            city: p.address.city ?? "",
            state: p.address.state ?? "",
            zipcode: p.address.zipcode ?? "",
          },
          distanceMiles: 0,
          source: "user_property" as const,
        }));
      setNearbyProperties(props);
    });
  }, [user?.userId]);

  useEffect(() => {
    if (!mapRef.current) return;

    const leadEntry = leadData[0];
    if (leadEntry.address) {
      mapRef.current?.centerMap({
        lat: leadEntry.address.lat,
        lng: leadEntry.address.long,
      });
    }

    setCampaignLeads([]);
  }, [stringify(leadData)]);

  const showLeads = leadData.length > 0;
  const campaignHasAllLeads = campaignLeads.length === leadData.length;

  const onAllLeadsButton = () => {
    const newCampaignLeads = [];
    if (!campaignHasAllLeads)
      for (let i = 0; i < leadData.length; i++)
        newCampaignLeads.push(leadData[i].leadId);
    setCampaignLeads(newCampaignLeads);
  };

  const onLeadButton = (i: number) =>
    setCampaignLeads(
      produce((draft) => {
        if (draft.includes(i)) return draft.filter((val) => val !== i);
        else draft.push(i);
      }),
    );

  const sortLeads = useCallback(() => {
    if (sortBy === "None" || sortBy.length === 0) return leadData;
    return leadData.sort((a, b) => {
      const ambFirstName = (a.contact?.firstName ?? "").localeCompare(
        b.contact?.firstName ?? "",
      );
      const ambLastName = (a.contact?.lastName ?? "").localeCompare(
        b.contact?.lastName ?? "",
      );
      if (sortBy === "Name")
        return ambFirstName === 0 ? ambLastName : ambFirstName;
      if (sortBy === "Email")
        return (a.contact?.email ?? "").localeCompare(b.contact?.email ?? "");
      if (sortBy === "Address")
        return (a.address?.street1 ?? "").localeCompare(
          b.address?.street1 ?? "",
        );
      return 0;
    });
  }, [stringify(leadData), sortBy]);

  const onStart = async (skipNav = false) => {
    if (campaignLeads.length == 0) return;

    const title =
      campaignTitle.length > 0
        ? campaignTitle
        : `${new Date().toDateString()} Campaign`;
    const leadsToAddToCampaign = leadData.filter((lead) =>
      campaignLeads.includes(lead.leadId),
    );

    setLoading(true);

    const res = await createCampaign({
      title,
      leads: campaignLeads,
      userId: user!.userId,
    });

    if (res.err || !res.data) {
      console.log(`Internal api error:`);
      console.log(res.err);
      errorSnack(`Connection unstable... please try again later`);
      return;
    }

    const addedXp = 100 + 50 * campaignLeads.length;
    await alterUserXP.addUserXp(addedXp);
    successSnack(
      `+ ${addedXp} XP - New campaign with ${campaignLeads.length} leads`,
    );

    const campaign = Normalizer.APINormalizer.campaign(res.data);
    setCampaign(campaign);

    if (!skipNav) toCampaignPage(campaign.campaignId, leadsToAddToCampaign);
  };

  return {
    showLeads,
    openSideNav,
    campaignLeads,
    campaignTitle,
    setCampaignTitle,
    loading,
    setLoading,
    mapRef,
    leadData: sortLeads(),
    nearbyProperties,
    activeLead,
    setActiveLead,
    campaignHasAllLeads,
    onAllLeadsButton,
    onLeadButton,
    onStart,
  };
};
