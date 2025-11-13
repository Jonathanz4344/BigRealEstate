import { useEffect, useState } from "react";
import {
  CampaignContactMethod,
  CampaignTab,
  type ILead,
} from "../../interfaces";
import { useGetCampaignLeads } from "../../pages/Campaign/hooks";
import {
  useCampaignStore,
  useCampaignPageStore,
  useAuthStore,
  useGoogleRequiredStore,
} from "../../stores";
import { useCampaignPageAPI } from "../api";
import { useSnack } from "../utils";

export const useCampaignPage = () => {
  const { user } = useAuthStore();
  const { campaign } = useCampaignStore();
  const setShowGoogleRequired = useGoogleRequiredStore(
    (state) => state.setShowGoogleRequired
  );
  const {
    tab,
    setTab,
    viewingLead: viewingLeadId,
    setViewingLead,
    selectedLeads,
    setSelectedLeads,
    setNotes,
  } = useCampaignPageStore();

  const [successMsg] = useSnack();
  const [leads, leadsLoading, setLeads] = useGetCampaignLeads(campaign);

  const [showEmail, setShowEmail] = useState(false);
  const [multiEmail, setMultiEmail] = useState(false);

  const viewingLead = leads.find((lead) => lead.leadId === viewingLeadId);
  const viewingCampaignLead = campaign.leads.find(
    (lead) => lead.leadId === viewingLeadId
  );

  const campaignPageAPIMethods = useCampaignPageAPI({
    leads,
    viewingLead,
    setLeads,
  });
  const {
    campaignLoading,
    title,
    setTitle,
    updateLeadContactMethod,
    getCampaign,
  } = campaignPageAPIMethods;

  const showSelectAllButton = selectedLeads.length !== campaign.leads.length;
  const pageLoading =
    campaignLoading ||
    leadsLoading ||
    (leads.length === 0 && campaign.leads.length !== 0);

  useEffect(() => {
    if (campaign.campaignId === -1) return setViewingLead(-1);
    if (campaign.leads.length > 0) setViewingLead(campaign.leads[0].leadId);
  }, [campaign.campaignId]);

  useEffect(() => {
    setNotes(viewingLead ? viewingLead.notes : "");
  }, [viewingLead?.leadId]);

  const onSendEmail = (leads: ILead[]) =>
    (async () => {
      const campaignLeads = leads.map(
        (lead) => campaign.leads.find((clead) => lead.leadId === clead.leadId)!
      );
      const nonEmailedCampaignLeads = campaignLeads.filter(
        (lead) => !lead.contactMethods.includes(CampaignContactMethod.Email)
      );
      await Promise.all(
        nonEmailedCampaignLeads.map(
          async (lead) =>
            await updateLeadContactMethod(
              CampaignContactMethod.Email,
              lead.leadId
            )
        )
      );
      setShowEmail(false);
      successMsg(`Email${leads.length > 1 ? "s" : ""} delivered successfully!`);
      await getCampaign(true);
    })();

  const selectAll = () => {
    const newSelected = campaign.leads.map((lead) => lead.leadId);
    setSelectedLeads(newSelected);
  };

  const unselectAll = () => {
    setSelectedLeads([]);

    if (tab === CampaignTab.Multi) {
      setTab(CampaignTab.Connect);
    }
  };

  return {
    pageLoading,

    showEmail,
    setShowEmail,
    title,
    setTitle,
    multiEmail,
    setMultiEmail,
    selectedLeads,
    setSelectedLeads,

    user,
    campaign,
    leads,

    viewingLeadId,
    viewingCampaignLead,
    setViewingLead,

    showSelectAllButton,
    selectAll,
    unselectAll,

    onSendEmail,
    getCampaign,
    updateLeadContactMethod,
    setShowGoogleRequired,
  };
};
