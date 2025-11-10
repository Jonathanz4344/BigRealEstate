import { useEffect, useState } from "react";
import type { ICampaign, ILead } from "../../../interfaces";
import { useLocation } from "react-router";
import { stringify } from "../../../utils";
import { useTimeoutEffect } from "../../../hooks";

export const useGetCampaignLeads = (campaign: ICampaign): [ILead[]] => {
  const { state } = useLocation();
  const [leads, setLeads] = useState<ILead[]>([]);
  const [usedState, setUsedState] = useState(false);

  useTimeoutEffect(
    () => {
      if (state["leads"]) {
        const leads = state["leads"] as ILead[];
        setLeads(leads);
      }
      setUsedState(state["leads"] ? true : false);
    },
    [stringify(state)],
    150
  );

  useEffect(() => {
    if (!usedState) {
      console.log(`Get leads from campaign`);
    }
  }, [usedState]);

  return [leads];
};
