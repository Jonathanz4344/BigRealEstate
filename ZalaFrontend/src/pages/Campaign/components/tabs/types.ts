import type { DemoData } from "../../../../interfaces";

export type CampaignFolderChildPropsState = {
  title: string;
  viewing: number;
  showBackBtn?: boolean;
  lead?: DemoData;
  disableSecondary?: boolean;
};

export type CampaignFolderChildProps = CampaignFolderChildPropsState & {
  onPrimary: () => void;
  onSecondary: () => void;
};
