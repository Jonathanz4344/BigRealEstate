import { useRef, useState } from "react";
import type { ICampaign, ILead } from "../../../interfaces";
import { useLocation } from "react-router";
import { Normalizer, stringify } from "../../../utils";
import { useApi, useTimeoutEffect } from "../../../hooks";
import { useAuthStore } from "../../../stores";

export const useGetCampaignLeads = (
  campaign: ICampaign
): [
  ILead[],
  boolean,
  React.Dispatch<React.SetStateAction<ILead[]>>,
  () => Promise<void>
] => {
  const user = useAuthStore((state) => state.user);
  const { state } = useLocation();

  const { getLeads: getApiLeads, apiResponseError, setSignal } = useApi();

  const isFetching = useRef(false);

  const [abortController, _] = useState(new AbortController());
  const [leads, setLeads] = useState<ILead[]>([]);
  const [loading, setLoading] = useState(false);

  useTimeoutEffect(
    () => {
      const stateLeads = state
        ? state["leads"]
          ? (state["leads"] as ILead[])
          : null
        : null;
      if (stateLeads && stateLeads.length > 0) {
        setLeads(
          campaign.leads.map(
            (lead) => stateLeads.find((aLead) => aLead.leadId === lead.leadId)!
          )
        );
      } else {
        getLeads();
      }
    },
    [stringify(state), campaign.campaignId],
    250
  );

  const getLeads = async () => {
    if (campaign.campaignId === -1 || campaign.leads.length === 0 || !user)
      return;

    if (isFetching.current) {
      abortController.abort();
    }

    isFetching.current = true;
    setSignal(abortController.signal, ["getLead"]);

    setLoading(true);
    const res = await getApiLeads(
      campaign.leads.map((lead) => lead.leadId),
      user.userId
    );

    if (res.err || !res.data) return apiResponseError("get leads", res.err);

    const apiLeads = res.data.map(Normalizer.APINormalizer.lead);

    setLoading(false);
    setLeads(
      campaign.leads.map(
        (lead) => apiLeads.find((aLead) => aLead.leadId === lead.leadId)!
      )
    );
  };

  return [leads, loading, setLeads, getLeads];
};
