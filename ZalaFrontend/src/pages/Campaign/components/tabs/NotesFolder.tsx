import { useFolderIcons } from "../../hooks";
import { CampaignTab } from "../../../../interfaces";
import { Icons } from "../../../../components";
import { Folder, LeadButtons, LeadFolder } from "../layout";
import type { CampaignFolderChildProps } from "./types";

type NotesFolderProps = CampaignFolderChildProps;

export const NotesFolder = ({
  title,
  showBackBtn,
  lead,
  viewing,
  disableSecondary,
  onPrimary,
  onSecondary,
}: NotesFolderProps) => {
  const icons = useFolderIcons({ active: CampaignTab.Notes, showBackBtn });

  return (
    <Folder
      title={title}
      icons={icons}
      footer={
        <LeadButtons
          secondary={{
            text: "Skip",
            icon: Icons.Skip,
            disabled: disableSecondary,
            onPress: onSecondary,
          }}
          primary={{ text: "Email", icon: Icons.Mail, onPress: onPrimary }}
        />
      }
    >
      <LeadFolder i={viewing}>
        {lead && (
          <div className="w-full h-full pr-[30px] py-[30px]">
            <div className="w-full h-full flex flex-col items-center relative">
              <div className="absolute-fill">
                <p className="w-full text-center text-xl font-bold">
                  Notes: {lead.agent}
                </p>
                <div className="w-full h-full flex grow-1 pb-[15px]">
                  <div className="w-full">
                    <textarea
                      className="text-area-style w-full max-h-full overflow-scroll pt-[15px]"
                      placeholder={`Notes on ${lead.agent}`}
                    />
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
