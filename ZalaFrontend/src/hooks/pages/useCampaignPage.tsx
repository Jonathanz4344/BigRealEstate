import { useEffect, useState } from "react";
import { CampaignTab } from "../../interfaces";
import { useGetCampaignLeads } from "../../pages/Campaign/hooks";
import { useCampaignStore, useCampaignPageStore } from "../../stores";
import { stringify } from "../../utils";
import { useCampaignPageAPI } from "../api";

export const useCampaignPage = () => {
  const { campaign } = useCampaignStore();
  const {
    tab,
    setTab,
    viewingLead: viewingLeadId,
    setViewingLead,
    selectedLeads,
    setSelectedLeads,
    setNotes,
  } = useCampaignPageStore();

  const [leads, leadsLoading, setLeads] = useGetCampaignLeads(campaign);
  const [showEmail, setShowEmail] = useState(false);
  const viewingLead = leads.find((lead) => lead.leadId === viewingLeadId);

  const campaignPageAPIMethods = useCampaignPageAPI({
    leads,
    viewingLead,
    setLeads,
  });
  const { campaignLoading, title, setTitle, updateLeadContactMethod } =
    campaignPageAPIMethods;

  const showSelectAllButton = selectedLeads.length !== campaign.leads.length;
  const pageLoading =
    campaignLoading ||
    leadsLoading ||
    (leads.length === 0 && campaign.leads.length !== 0);

  useEffect(() => {
    if (campaign.leads.length > 0) setViewingLead(campaign.leads[0].leadId);
    else setViewingLead(-1);
  }, [stringify(campaign.leads)]);

  useEffect(() => {
    setNotes(viewingLead ? viewingLead.notes : "");
  }, [viewingLead?.leadId]);

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
    title,
    setTitle,
    leads,
    setShowEmail,
    unselectAll,
    updateLeadContactMethod,
    showSelectAllButton,
    selectAll,
    selectedLeads,
    setViewingLead,
    setSelectedLeads,
    showEmail,
  };
};
