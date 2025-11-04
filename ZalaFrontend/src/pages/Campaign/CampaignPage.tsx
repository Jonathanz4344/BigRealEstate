import { Icons, LeadListSection } from "../../components";
import {
  useCampaignFolderStore,
  useCampaignStore,
  useSearchQueryStore,
} from "../../stores";
import { useEffect, useState } from "react";
import { produce } from "immer";
import { stringify } from "../../utils";
import { CampaignTab, DEFAULT_CAMPAIGN } from "../../interfaces";
import { useAppHeader, useLeadSearchPage, useTimeoutEffect } from "../../hooks";
import { ButtonVariant } from "../../components/buttons/ButtonVariant";
import { CampaignFolders } from "./components";

export const CampaignPage = () => {
  const campaign = useCampaignStore((state) => state.campaign);
  const { data: leadData, setQuery } = useSearchQueryStore();
  const { tab, setTab } = useCampaignFolderStore();

  const { onSearchCore } = useAppHeader();
  const { campaignLeads, onAllLeadsButton, onStart } = useLeadSearchPage();

  const [selected, setSelected] = useState<number[]>([]);
  const [viewing, setViewing] = useState(-1);

  const showSelectAllButton = selected.length !== campaign.leads.length;

  useEffect(() => {
    if (campaign.leads.length > 0) setViewing(0);
    else setViewing(-1);
  }, [stringify(campaign.leads)]);

  // Debug get leads when load fake api call

  useEffect(() => {
    if (campaignLeads.length === 0) return;
    onStart(true);
  }, [stringify(campaignLeads)]);

  useEffect(() => {
    if (leadData.length === 0) return;
    onAllLeadsButton();
  }, [stringify(leadData)]);

  useTimeoutEffect(
    () => {
      if (campaign.campaignId === DEFAULT_CAMPAIGN.campaignId) {
        setQuery("Henrietta NY");
        onSearchCore("Henrietta NY", "gpt");
      }
    },
    [],
    250
  );

  // End Debug

  const selectAll = () => {
    const newSelected = campaign.leads.map((_, i) => i);
    setSelected(newSelected);
  };

  const unselectAll = () => {
    setSelected([]);

    if (tab === CampaignTab.Multi) {
      setTab(CampaignTab.Connect);
    }
  };

  return (
    <div className="flex flex-1 flex-row">
      <div className="flex-[.6] h-full max-h-full px-[60px] py-[30px] flex flex-col">
        <div className="grow-1 w-full max-w-full flex flex-col space-y-[30px]">
          <div className="w-ful">
            <input
              className="border-text-input w-[50%] !text-2xl py-[5px] line-clamp-1"
              placeholder="Campaign Title"
            />
          </div>
          <div className="grow-1 w-full">
            <CampaignFolders
              allLeads={campaign.leads}
              currentLeadIndex={viewing}
              selectedLeadIndexs={selected}
              setViewing={setViewing}
              unselectAll={unselectAll}
            />
          </div>
        </div>
      </div>
      <LeadListSection
        leads={campaign.leads}
        footerBtn={{
          text: showSelectAllButton ? "Select all" : "Unselect all",
          icon: showSelectAllButton
            ? Icons.CheckboxOutline
            : Icons.CheckboxChecked,
          onClick: showSelectAllButton ? selectAll : unselectAll,
          variant: showSelectAllButton
            ? ButtonVariant.Primary
            : ButtonVariant.Tertiary,
        }}
        getLeadProps={(_lead, i) => ({
          active: selected.includes(i),
          onTitleClick: () => setViewing(i),
          button: {
            text: "Select lead",
            icon: selected.includes(i)
              ? Icons.CheckboxChecked
              : Icons.CheckboxOutline,
            onClick: () =>
              setSelected(
                produce((draft) => {
                  if (draft.includes(i)) return draft.filter((v) => v !== i);
                  else draft.push(i);
                })
              ),
          },
        })}
      />
    </div>
  );
};
