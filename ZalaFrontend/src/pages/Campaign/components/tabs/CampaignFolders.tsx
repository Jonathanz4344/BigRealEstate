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
  notesRef: React.RefObject<HTMLDivElement | null>;
  contactRef: React.RefObject<HTMLDivElement | null>;
  emailButtonRef: React.RefObject<HTMLDivElement | null>;
  infoRef: React.RefObject<HTMLDivElement | null>;
  allLeads: ILead[];
  onPrimary?: (from: string) => void;
  unselectAll: () => void;
  onContactMethod: (toggleMethod: CampaignContactMethod) => void;
};

export const CampaignFolders = ({
  notesRef,
  contactRef,
  emailButtonRef,
  infoRef,
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
    disableSecondary: leadIndex === allLeads.length - 1,
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
      contactRef={contactRef}
      {...campaignFolderChildProps}
      {...singleActions}
      onContactMethod={onContactMethod}
    />
  ) : tab === CampaignTab.Notes ? (
    <NotesFolder notesRef={notesRef} {...campaignFolderChildProps} {...singleActions} />
  ) : tab === CampaignTab.Profile ? (
    <InfoFolder infoRef={infoRef} {...campaignFolderChildProps} {...singleActions} />
  ) : tab === CampaignTab.Multi ? (
    <MultiFolder
      emailButtonRef={emailButtonRef}
      {...campaignFolderChildProps}
      {...multiActions}
      disableSecondary={undefined}
      title={`${selectedLeads.length} Selected Leads`}
      allLeads={allLeads}
      leads={allLeads.filter((lead) => selectedLeads.includes(lead.leadId))}
    />
  ) : null;
};
