import { produce } from "immer";
import React, { useRef, useState } from "react";
import {
  CampaignContactMethod,
  type ACampaign,
  type ILead,
} from "../../interfaces";
import { Normalizer } from "../../utils";
import { useAppNavigation, useTimeoutEffect } from "../utils";
import { useApi } from "./useApi";
import { useParams } from "react-router";
import {
  useCampaignStore,
  useAuthStore,
  useCampaignPageStore,
} from "../../stores";

type UseCampaignPageAPI = {
  leads: ILead[];
  viewingLead?: ILead;
  setLeads: React.Dispatch<React.SetStateAction<ILead[]>>;
};

export const useCampaignPageAPI = ({
  leads,
  setLeads,
  viewingLead,
}: UseCampaignPageAPI) => {
  const campaignId = useParams()["campaignId"];
  const { campaign, setCampaign } = useCampaignStore();
  const user = useAuthStore((state) => state.user);
  const { notes } = useCampaignPageStore();

  const { toNotFound } = useAppNavigation();
  const {
    updateCampaign,
    setSignal,
    getCampaign: getCampaignApi,
    updateLead,
    updateCampaignLead,
    apiResponseError,
  } = useApi();

  const titleFetchInProgress = useRef(false);

  const [campaignLoading, setCampaignLoading] = useState(true);

  const [titleLoading, setTitleLoading] = useState(false);
  const [title, setTitle] = useState(campaign.campaignName);
  const [abortController, _setAbortController] = useState(
    new AbortController()
  );

  useTimeoutEffect(
    () => {
      if (campaign.campaignId === -1 && campaignId) {
        getCampaign();
      } else setCampaignLoading(false);
    },
    [campaignId],
    250
  );

  useTimeoutEffect(
    () => {
      updateTitle();
    },
    [title],
    500
  );

  useTimeoutEffect(
    () => {
      updateLeadNotes();
    },
    [notes],
    500
  );

  const getCampaign = async (disableLoad = false) => {
    if (!campaignId || !user) return;

    if (!disableLoad) setCampaignLoading(true);
    const res = await getCampaignApi(campaignId, user!.userId);
    if (!disableLoad) setCampaignLoading(false);

    if (res.err || !res.data)
      return (
        apiResponseError("getting campaign", res.err, {
          showSnack: false,
        }),
        toNotFound()
      );

    apiCampaignResponse(res.data);
  };

  const updateTitle = async () => {
    if (campaign.campaignId == -1 || campaign.campaignName === title) return;

    if (titleFetchInProgress.current) {
      abortController.abort();
    }

    setTitleLoading(true);
    titleFetchInProgress.current = true;
    setSignal(abortController.signal, ["updateCampaign"]);

    const res = await updateCampaign({
      title,
      leads: leads.map((lead) => lead.leadId),
      userId: user!.userId,
      campaignId: campaign.campaignId,
    });

    setTitleLoading(false);
    titleFetchInProgress.current = false;

    if (res.err || !res.data)
      return apiResponseError("updating campaign", res.err);

    apiCampaignResponse(res.data);
  };

  const updateLeadContactMethod = async (
    method: CampaignContactMethod,
    leadId: number
  ) => {
    if (!viewingLead || campaign.campaignId === -1) return;

    const campaignLead = campaign.leads.find((lead) => lead.leadId === leadId)!;
    let contactMethods = campaignLead.contactMethods;

    if (contactMethods.includes(method))
      contactMethods = contactMethods.filter((existing) => existing !== method);
    else contactMethods.push(method);

    const res = await updateCampaignLead({
      campaignId: campaign.campaignId,
      userId: user!.userId,
      leadId: campaignLead.leadId,
      contactMethods,
    });

    if (res.err || !res.data)
      return apiResponseError("updating campaign lead", res.err);

    await getCampaign(true);
  };

  const updateLeadNotes = async () => {
    if (
      !viewingLead ||
      notes === viewingLead.notes ||
      campaign.campaignId === -1
    )
      return;

    const res = await updateLead({
      userId: user!.userId,
      buisness: viewingLead.buisness,
      leadId: viewingLead.leadId,
      licenseNumber: viewingLead.licenseNum,
      notes,
      website: viewingLead.website,
    });

    if (res.err || !res.data)
      return apiResponseError("updating a lead", res.err);

    const apiLead = Normalizer.APINormalizer.lead(res.data);

    setLeads(
      produce((draft) => {
        const index = draft.findIndex((lead) => lead.leadId === apiLead.leadId);
        if (index === -1) draft.push(apiLead);
        else draft[index] = apiLead;
      })
    );
  };

  const apiCampaignResponse = (campaign: ACampaign) => {
    const apiCampaign = Normalizer.APINormalizer.campaign(campaign);

    setCampaign(apiCampaign);
    setTitle(apiCampaign.campaignName);
  };

  return {
    campaignLoading,
    titleLoading,
    title,
    setTitle,

    getCampaign,
    updateTitle,
    updateLeadContactMethod,
    updateLeadNotes,
  };
};
