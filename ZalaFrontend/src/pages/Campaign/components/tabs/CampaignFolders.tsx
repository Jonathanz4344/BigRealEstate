import {
  CampaignContactMethod,
  CampaignTab,
  type ILead,
} from "../../../../interfaces";
import { ContactFolder } from "./ContactFolder";
import { NotesFolder } from "./NotesFolder";
import { InfoFolder } from "./InfoFolder";
import { MultiFolder } from "./MultiFolder";
import type { CampaignFolderChildPropsState } from "./types";
import { useCampaignPageStore } from "../../../../stores";

type CampaignFoldersProps = {
  allLeads: ILead[];
  onPrimary?: (from: string) => void;
  unselectAll: () => void;
  onContactMethod: (toggleMethod: CampaignContactMethod) => void;
};

export const CampaignFolders = ({
  allLeads,
  onPrimary = () => {},
  unselectAll,
  onContactMethod,
}: CampaignFoldersProps) => {
  const { tab, selectedLeads, viewingLead, setViewingLead } =
    useCampaignPageStore();
  const showBackBtn = selectedLeads.length > 1;
  const viewing = viewingLead;
  const totalLeads = allLeads.length;
  const leadIndex = allLeads.findIndex((lead) => lead.leadId === viewing);
  const lead = allLeads[leadIndex];

  const campaignFolderChildProps: CampaignFolderChildPropsState = {
    title: `Lead #${leadIndex + 1} of ${totalLeads}`,
    viewing,
    lead,
    showBackBtn,
    disableSecondary: viewing === allLeads.length - 1,
  };

  const singleActions = {
    onPrimary: () => onPrimary("single"),
    onSecondary: () => {
      if (leadIndex < allLeads.length - 1)
        setViewingLead(allLeads[leadIndex + 1].leadId);
    },
  };
  const multiActions = {
    onPrimary: () => onPrimary("multi"),
    onSecondary: () => unselectAll(),
  };

  return tab === CampaignTab.Connect ? (
    <ContactFolder
      {...campaignFolderChildProps}
      {...singleActions}
      onContactMethod={onContactMethod}
    />
  ) : tab === CampaignTab.Notes ? (
    <NotesFolder {...campaignFolderChildProps} {...singleActions} />
  ) : tab === CampaignTab.Profile ? (
    <InfoFolder {...campaignFolderChildProps} {...singleActions} />
  ) : tab === CampaignTab.Multi ? (
    <MultiFolder
      {...campaignFolderChildProps}
      {...multiActions}
      disableSecondary={undefined}
      title={`${selectedLeads.length} Selected Leads`}
      allLeads={allLeads}
      leads={allLeads.filter((lead) => selectedLeads.includes(lead.leadId))}
    />
  ) : null;
};
