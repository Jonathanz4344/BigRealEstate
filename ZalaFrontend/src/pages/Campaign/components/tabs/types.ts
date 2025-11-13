import type { ILead } from "../../../../interfaces";

export type CampaignFolderChildPropsState = {
  title: string;
  viewing: number;
  showBackBtn?: boolean;
  lead?: ILead;
  disableSecondary?: boolean;
};

export type CampaignFolderChildProps = CampaignFolderChildPropsState & {
  onPrimary: () => void;
  onSecondary: () => void;
};
