import { useCampaignFolderStore } from "../../../../stores";
import { CampaignTab, type DemoData } from "../../../../interfaces";
import { ContactFolder } from "./ContactFolder";
import { NotesFolder } from "./NotesFolder";
import { InfoFolder } from "./InfoFolder";
import { MultiFolder } from "./MultiFolder";
import type { CampaignFolderChildPropsState } from "./types";

type CampaignFoldersProps = {
  allLeads: DemoData[];
  currentLeadIndex: number;
  selectedLeadIndexs: number[];
  onPrimary?: () => void;
  setViewing: (i: number) => void;
  unselectAll: () => void;
};

export const CampaignFolders = ({
  allLeads,
  currentLeadIndex,
  selectedLeadIndexs,
  onPrimary = () => {},
  setViewing,
  unselectAll,
}: CampaignFoldersProps) => {
  const { tab } = useCampaignFolderStore();
  const showBackBtn = selectedLeadIndexs.length > 1;
  const viewing = currentLeadIndex;
  const totalLeads = allLeads.length;
  const lead = allLeads.at(viewing);

  const campaignFolderChildProps: CampaignFolderChildPropsState = {
    title: `Lead #${viewing + 1} of ${totalLeads}`,
    viewing,
    lead,
    showBackBtn,
    disableSecondary: viewing === allLeads.length - 1,
  };

  const singleActions = {
    onPrimary: onPrimary,
    onSecondary: () => {
      if (viewing < allLeads.length - 1) setViewing(currentLeadIndex + 1);
    },
  };
  const multiActions = {
    onPrimary: () => {},
    onSecondary: () => unselectAll(),
  };

  return tab === CampaignTab.Connect ? (
    <ContactFolder {...campaignFolderChildProps} {...singleActions} />
  ) : tab === CampaignTab.Notes ? (
    <NotesFolder {...campaignFolderChildProps} {...singleActions} />
  ) : tab === CampaignTab.Profile ? (
    <InfoFolder {...campaignFolderChildProps} {...singleActions} />
  ) : tab === CampaignTab.Multi ? (
    <MultiFolder
      {...campaignFolderChildProps}
      {...multiActions}
      disableSecondary={undefined}
      title={`${selectedLeadIndexs.length} Selected Leads`}
      allLeads={allLeads}
      leads={allLeads.filter((_, i) => selectedLeadIndexs.includes(i))}
      setViewing={setViewing}
    />
  ) : null;
};
