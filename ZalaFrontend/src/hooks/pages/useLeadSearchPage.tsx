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
import { useApi } from "../api";
import type { ILead } from "../../interfaces";

export const useLeadSearchPage = () => {
  const user = useAuthStore((state) => state.user);
  const leadData = useSearchQueryStore((state) => state.data);
  const setCampaign = useCampaignStore((state) => state.setCampaign);
  const sortBy = useSearchFilterStore((state) => state.sortBy);
  const openSideNav = useSideNavControlStore((state) => state.open);

  const { createCampaign, createLead } = useApi();
  const [_successSnack, errorSnack] = useSnack();
  const { toCampaignPage } = useAppNavigation();

  const mapRef = useRef<MapRefHandle>(null);

  const [activeLead, setActiveLead] = useState<number>(-1);
  const [campaignLeads, setCampaignLeads] = useState<number[]>([]);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    if (leadData.length > 0) {
      mapRef.current?.centerMap({
        lat: leadData[0].address.lat,
        lng: leadData[0].address.long,
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
      const ambFirstName = a.contact.firstName.localeCompare(
        b.contact.firstName
      );
      const ambLastName = a.contact.firstName.localeCompare(
        b.contact.firstName
      );
      if (sortBy === "Name")
        return ambFirstName === 0 ? ambLastName : ambFirstName;
      if (sortBy === "Email")
        return a.contact < b.contact ? -1 : a.contact > b.contact ? 1 : 0;
      if (sortBy === "Address")
        return a.address < b.address ? -1 : a.address > b.address ? 1 : 0;
      return 0;
    });
  }, [stringify(leadData), sortBy]);

  const onStart = async (skipNav = false) => {
    if (campaignLeads.length == 0) return;

    const title =
      campaignTitle.length > 0
        ? campaignTitle
        : `${new Date().toDateString()} Campaign`;
    const leadsToAddToCampaign = leadData.filter((_lead, i) =>
      campaignLeads.includes(i)
    );

    setLoading(true);
    const apiLeads: ILead[] = (
      await Promise.all(
        leadsToAddToCampaign.map(async (lead) => {
          console.log(`Creating ${lead.leadId}`);
          return (await createLead({ lead, createdById: user!.userId })).data
            ?.lead;
        })
      )
    )
      .map((apiLead) => apiLead && Normalizer.APINormalizer.lead(apiLead))
      .filter((apiLead) => apiLead) as ILead[];
    const leadIds = apiLeads.map((lead) => lead.leadId);

    const res = await createCampaign({
      title,
      leads: leadIds,
      userId: user!.userId,
    });

    if (res.err || !res.data) {
      console.log(`Internal api error:`);
      console.log(res.err);
      errorSnack(`Connection unstable... please try again later`);
      return;
    }

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
    activeLead,
    setActiveLead,
    campaignHasAllLeads,
    onAllLeadsButton,
    onLeadButton,
    onStart,
  };
};
