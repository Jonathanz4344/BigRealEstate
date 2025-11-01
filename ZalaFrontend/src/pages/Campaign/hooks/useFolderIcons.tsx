import { Icons, type IconProps } from "../../../components";
import { useCampaignFolderStore } from "../../../stores";
import { COLORS } from "../../../config";
import { CampaignTab } from "../../../interfaces";

type UseFolderIconsProps = {
  active: CampaignTab;
  showBackBtn?: boolean;
};

export const useFolderIcons = ({
  active,
  showBackBtn,
}: UseFolderIconsProps) => {
  const { tab, setTab } = useCampaignFolderStore();

  const sharedIcons: IconProps[] = [
    {
      name: Icons.Connect,
      color: active === CampaignTab.Connect ? COLORS.accent : undefined,
      onClick: () => setTab(CampaignTab.Connect),
    },
    {
      name: Icons.Notes,
      color: active === CampaignTab.Notes ? COLORS.accent : undefined,
      onClick: () => setTab(CampaignTab.Notes),
    },
    {
      name: Icons.User,
      color: active === CampaignTab.Profile ? COLORS.accent : undefined,
      onClick: () => setTab(CampaignTab.Profile),
    },
  ];
  const icons: IconProps[] =
    showBackBtn || tab === CampaignTab.Multi
      ? [
          {
            name: tab === CampaignTab.Multi ? Icons.Menu : Icons.Arrow,
            color: active === CampaignTab.Multi ? COLORS.accent : undefined,
            onClick: () => setTab(CampaignTab.Multi),
          },
          ...sharedIcons,
        ]
      : [...sharedIcons];

  return icons;
};
