import { Icons } from "../../../../components";
import { CampaignTab } from "../../../../interfaces";
import { useFolderIcons } from "../../hooks";
import { Folder, LeadButtons, LeadFolder, LeadTitleValue } from "../layout";
import type { CampaignFolderChildProps } from "./types";

type InfoFolderProps = CampaignFolderChildProps;

export const InfoFolder = ({
  title,
  showBackBtn,
  lead,
  viewing,
  disableSecondary,
  onPrimary,
  onSecondary,
}: InfoFolderProps) => {
  const icons = useFolderIcons({ active: CampaignTab.Profile, showBackBtn });

  return (
    <Folder
      title={title}
      icons={icons}
      footer={
        <LeadButtons
          secondary={{
            text: "Skip",
            icon: Icons.Skip,
            onPress: onSecondary,
            disabled: disableSecondary,
          }}
          primary={{ text: "Email", icon: Icons.Mail, onPress: onPrimary }}
        />
      }
    >
      <LeadFolder i={viewing}>
        {lead && (
          <div className="w-full h-full pr-[30px] py-[30px]">
            <div className="relative w-full h-full">
              <div className="absolute-fill flex flex-col items-center overflow-scroll">
                <p className="w-full text-center text-xl font-bold">
                  Contact: {lead.agent}
                </p>
                <div className="w-full flex grow-1 items-center justify-center">
                  <div className="w-full flex flex-col space-y-[15px]">
                    <LeadTitleValue title="Email:" value={lead.contact} />
                    <LeadTitleValue title="Phone #:" value={"5853239877"} />
                    <LeadTitleValue
                      title="Lead type:"
                      value={"Real estate agent"}
                    />
                    <LeadTitleValue
                      title="Buisness:"
                      value={"Real Real Estate Agency"}
                    />
                    <LeadTitleValue title="Website:" value={"realagent.com"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </LeadFolder>
    </Folder>
  );
};
