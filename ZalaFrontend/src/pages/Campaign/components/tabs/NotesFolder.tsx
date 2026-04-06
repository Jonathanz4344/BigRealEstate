import { useFolderIcons } from "../../hooks";
import { CampaignTab } from "../../../../interfaces";
import { Icons, LeadNotesSection } from "../../../../components";
import { Folder, LeadButtons, LeadFolder } from "../layout";
import type { CampaignFolderChildProps } from "./types";
import { useCampaignPageStore } from "../../../../stores";

type NotesFolderProps = CampaignFolderChildProps & {
  notesRef: React.RefObject<HTMLDivElement | null>;
};

export const NotesFolder = ({
  notesRef,
  title,
  showBackBtn,
  lead,
  viewing,
  disableSecondary,
  onPrimary,
  onSecondary,
}: NotesFolderProps) => {
  const { notes, setNotes } = useCampaignPageStore();
  const icons = useFolderIcons({ active: CampaignTab.Notes, showBackBtn });
  const hasEmail = lead?.contact?.email === "" || lead?.contact?.email === null;
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
          primary={{
            text: "Email",
            icon: Icons.Mail,
            disabled: hasEmail,
            onPress: onPrimary,
          }}
        />
      }
    >
      <LeadFolder i={viewing}>
        {lead && (
          <div className="w-full h-full pr-7.5 py-7.5" ref={notesRef}>
            <div className="w-full h-full flex flex-col items-center relative">
              <div className="absolute-fill">
                <p className="w-full text-center text-xl font-bold">
                  Notes: {lead.contact?.firstName} {lead.contact?.lastName}
                </p>
                <div className="w-full h-full flex grow pb-3.75">
                  <LeadNotesSection
                    lead={lead}
                    notes={notes}
                    setNotes={setNotes}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </LeadFolder>
    </Folder>
  );
};
