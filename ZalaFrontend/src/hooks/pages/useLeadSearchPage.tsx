import { produce } from "immer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCampaignStore,
  useSearchFilterStore,
  useSearchQueryStore,
  useSideNavControlStore,
} from "../../stores";
import { stringify } from "../../utils";
import type { MapRefHandle } from "../components";
import { useAppNavigation } from "../utils";

export const useLeadSearchPage = () => {
  const leadData = useSearchQueryStore((state) => state.data);
  const setCampaign = useCampaignStore((state) => state.setCampaign);
  const sortBy = useSearchFilterStore((state) => state.sortBy);
  const openSideNav = useSideNavControlStore((state) => state.open);

  const { toCampaignPage } = useAppNavigation();

  const mapRef = useRef<MapRefHandle>(null);

  const [activeLead, setActiveLead] = useState<number>(-1);
  const [campaignLeads, setCampaignLeads] = useState<number[]>([]);
  const [campaignTitle, setCampaignTitle] = useState("");

  useEffect(() => {
    if (!mapRef.current) return;

    if (leadData.length > 0) {
      mapRef.current?.centerMap({
        lat: leadData[0].latitude,
        lng: leadData[0].longitude,
      });
    }

    setCampaignLeads([]);
  }, [stringify(leadData)]);

  const showLeads = leadData.length > 0;
  const campaignHasAllLeads = campaignLeads.length === leadData.length;

  const onAllLeadsButton = () => {
    const newCampaignLeads = [];
    if (!campaignHasAllLeads)
      for (let i = 0; i < leadData.length; i++) newCampaignLeads.push(i);
    setCampaignLeads(newCampaignLeads);
  };

  const onLeadButton = (i: number) =>
    setCampaignLeads(
      produce((draft) => {
        if (draft.includes(i)) return draft.filter((val) => val !== i);
        else draft.push(i);
      })
    );

  const sortLeads = useCallback(() => {
    if (sortBy === "None" || sortBy.length === 0) return leadData;
    return leadData.sort((a, b) => {
      if (sortBy === "Name")
        return a.agent < b.agent ? -1 : a.agent > b.agent ? 1 : 0;
      if (sortBy === "Email")
        return a.contact < b.contact ? -1 : a.contact > b.contact ? 1 : 0;
      if (sortBy === "Address")
        return a.address < b.address ? -1 : a.address > b.address ? 1 : 0;
      return 0;
    });
  }, [stringify(leadData), sortBy]);

  const onStart = (skipNav = false) => {
    // some async method gets campaign id
    const campaignId = 1234;
    const leads = leadData.filter((_lead, i) => campaignLeads.includes(i));
    setCampaign({ campaignId, leads });
    if (!skipNav) toCampaignPage(campaignId);
  };

  return {
    showLeads,
    openSideNav,
    campaignLeads,
    campaignTitle,
    setCampaignTitle,
    mapRef,
    leadData: sortLeads(),
    activeLead,
    setActiveLead,
    campaignHasAllLeads,
    onAllLeadsButton,
    onLeadButton,
    onStart,
  };
};
