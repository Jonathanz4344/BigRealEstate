import { CampaignTab } from "../../../../interfaces";
import { Icons } from "../../../../components";
import { useFolderIcons } from "../../hooks";
import {
  Folder,
  LeadButtons,
  LeadFolder,
  LeadTitleValue,
  ContactMethod,
} from "../layout";
import type { CampaignFolderChildProps } from "./types";

type ContactFolderProps = CampaignFolderChildProps;

export const ContactFolder = ({
  title,
  lead,
  showBackBtn,
  viewing,
  disableSecondary,
  onPrimary,
  onSecondary,
}: ContactFolderProps) => {
  const icons = useFolderIcons({ active: CampaignTab.Connect, showBackBtn });
  return (
    <Folder
      icons={icons}
      title={title}
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
          <div className="w-full flex flex-col items-center pr-[30px] pt-[30px]">
            <p className="w-full text-center text-xl font-bold">
              Contact: {lead.agent}
            </p>
            <div className="w-full flex grow-1 items-center justify-center">
              <div className="w-full flex flex-col space-y-[15px]">
                <LeadTitleValue title="Email:" value={lead.contact} />
                <LeadTitleValue title="Phone #:" value={"5853239877"} />
                <LeadTitleValue title="Contacted by:">
                  <div className="flex flex-row justify-between w-full pt-[5px]">
                    <ContactMethod text="Email" icon={Icons.Mail} />
                    <ContactMethod text="Phone" icon={Icons.Phone} />
                    <ContactMethod text="SMS" icon={Icons.Txt} />
                  </div>
                </LeadTitleValue>
              </div>
            </div>
          </div>
        )}
      </LeadFolder>
    </Folder>
  );
};
