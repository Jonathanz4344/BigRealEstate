import type { CampaignFolderChildProps } from "./types";
import { CampaignTab, type DemoData } from "../../../../interfaces";
import { useFolderIcons } from "../../hooks";
import { Folder, LeadButtons } from "../layout";
import { ArrowLeadCard, Icons } from "../../../../components";
import { useCampaignFolderStore } from "../../../../stores";

type MultiFolderProps = Omit<CampaignFolderChildProps, "lead"> & {
  allLeads: DemoData[];
  leads: DemoData[];
  setViewing: (i: number) => void;
};

export const MultiFolder = ({
  title,
  showBackBtn,
  allLeads,
  leads,
  disableSecondary,
  setViewing,
  onPrimary,
  onSecondary,
}: MultiFolderProps) => {
  const setTab = useCampaignFolderStore((state) => state.setTab);
  const icons = useFolderIcons({ active: CampaignTab.Multi, showBackBtn });
  return (
    <Folder
      title={title}
      icons={icons}
      footer={
        <LeadButtons
          secondary={
            leads.length !== allLeads.length
              ? {
                  text: "Unselect All",
                  icon: Icons.CheckboxChecked,
                  disabled: disableSecondary,
                  onPress: onSecondary,
                }
              : undefined
          }
          primary={{ text: "Email All", icon: Icons.Mail, onPress: onPrimary }}
        />
      }
    >
      <div className="full py-[15px] px-[15px]">
        <div className="full relative">
          <div className="absolute-fill overflow-y-scroll px-[15px] space-y-[30px]">
            {leads.map((lead) => (
              <ArrowLeadCard
                lead={lead}
                i={allLeads.indexOf(lead)}
                onClick={() => (
                  setViewing(allLeads.indexOf(lead)),
                  setTab(CampaignTab.Connect)
                )}
              />
            ))}
            <div className="h-[50px]" />
          </div>
        </div>
      </div>
    </Folder>
  );
};
