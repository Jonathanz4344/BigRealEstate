import { CampaignContactMethod, CampaignTab } from "../../../../interfaces";
import { Icons, LeadTitleValue } from "../../../../components";
import { useFolderIcons } from "../../hooks";
import { Folder, LeadButtons, LeadFolder, ContactMethod } from "../layout";
import type { CampaignFolderChildProps } from "./types";
import { useCampaignStore } from "../../../../stores";

type ContactFolderProps = CampaignFolderChildProps & {
  contactRef: React.RefObject<HTMLDivElement | null>;
  onContactMethod: (method: CampaignContactMethod) => void;
};

export const ContactFolder = ({
  contactRef,
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
  const hasEmail = lead?.contact?.email === "" || lead?.contact?.email === null;
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
          primary={{
            text: "Email",
            disabled: hasEmail,
            icon: Icons.Mail,
            onPress: onPrimary,
          }}
        />
      }
    >
      <LeadFolder i={viewing}>
        {lead && (
          <div className="w-full flex flex-col items-center pr-.5 pt-.5">
            <p className="w-full text-center text-xl font-bold">
              Contact: {lead.contact?.firstName} {lead.contact?.lastName}
            </p>
            <div className="w-full flex grow items-center justify-center">
              <div className="w-full flex flex-col space-y-3.5">
                <LeadTitleValue title="Email:" value={lead.contact?.email} />
                <LeadTitleValue title="Phone #:" value={lead.contact?.phone} />
                <LeadTitleValue title="Contacted by:">
                  <div className="flex flex-row justify-between w-full pt-1.25 px-3.5" ref={contactRef}>
                    <ContactMethod
                      active={campaignLead?.contactMethods.includes(
                        CampaignContactMethod.Email,
                      )}
                      onClick={
                        hasEmail
                          ? () => {
                              return;
                            }
                          : () => onContactMethod(CampaignContactMethod.Email)
                      }
                      text="Email"
                      icon={Icons.Mail}
                      disabled={hasEmail}
                    />
                    <ContactMethod
                      active={campaignLead?.contactMethods.includes(
                        CampaignContactMethod.Phone,
                      )}
                      onClick={() =>
                        onContactMethod(CampaignContactMethod.Phone)
                      }
                      text="Phone"
                      icon={Icons.Phone}
                    />
                    <ContactMethod
                      active={campaignLead?.contactMethods.includes(
                        CampaignContactMethod.SMS,
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
