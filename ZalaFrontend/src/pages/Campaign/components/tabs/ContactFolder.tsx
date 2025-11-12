import { CampaignContactMethod, CampaignTab } from "../../../../interfaces";
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
import { useCampaignStore } from "../../../../stores";

type ContactFolderProps = CampaignFolderChildProps & {
  onContactMethod: (method: string) => void;
};

export const ContactFolder = ({
  title,
  lead,
  showBackBtn,
  viewing,
  disableSecondary,
  onPrimary,
  onSecondary,
  onContactMethod,
}: ContactFolderProps) => {
  const campaign = useCampaignStore((state) => state.campaign);
  const campaignLead = campaign.leads.find((lead) => lead.leadId === viewing);
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
              Contact: {lead.contact.firstName} {lead.contact.lastName}
            </p>
            <div className="w-full flex grow-1 items-center justify-center">
              <div className="w-full flex flex-col space-y-[15px]">
                <LeadTitleValue title="Email:" value={lead.contact.email} />
                <LeadTitleValue title="Phone #:" value={lead.contact.phone} />
                <LeadTitleValue title="Contacted by:">
                  <div className="flex flex-row justify-between w-full pt-[5px] px-[15px]">
                    <ContactMethod
                      active={campaignLead?.contactMethods.includes(
                        CampaignContactMethod.Email
                      )}
                      onClick={() =>
                        onContactMethod(CampaignContactMethod.Email)
                      }
                      text="Email"
                      icon={Icons.Mail}
                    />
                    <ContactMethod
                      active={campaignLead?.contactMethods.includes(
                        CampaignContactMethod.Phone
                      )}
                      onClick={() =>
                        onContactMethod(CampaignContactMethod.Phone)
                      }
                      text="Phone"
                      icon={Icons.Phone}
                    />
                    <ContactMethod
                      active={campaignLead?.contactMethods.includes(
                        CampaignContactMethod.SMS
                      )}
                      onClick={() => onContactMethod(CampaignContactMethod.SMS)}
                      text="SMS"
                      icon={Icons.Txt}
                    />
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
