import type { ILead } from "../../interfaces";
import clsx from "clsx";

type LeadNotesSectionProps = {
  lead: ILead;
  notes: string;
  editable?: boolean;
  setNotes?: (v: string) => void;
};

export const LeadNotesSection = ({
  lead,
  notes,
  editable = true,
  setNotes = () => {},
}: LeadNotesSectionProps) => {
  return (
    <div className="w-full">
      <textarea
        className={clsx(
          "text-area-style w-full max-h-full overflow-scroll pt-3.75",
          editable ? "" : "!focus:border-[unset] cursor-default border-b-0!",
        )}
        disabled={!editable}
        placeholder={`Notes on ${lead.contact?.firstName} ${lead.contact?.lastName}`}
        value={notes}
        onChange={({ target: { value } }) => setNotes(value)}
      />
    </div>
  );
};
