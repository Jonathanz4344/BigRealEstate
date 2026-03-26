import { LeadTitleValue } from "..";
import type { ILead } from "../../interfaces";

type LeadInfoSectionProps = {
  lead: ILead;
};

export const LeadInfoSection = ({ lead }: LeadInfoSectionProps) => {
  return (
    <div className="w-full flex flex-col space-y-3.75">
      <LeadTitleValue title="Email:" value={lead.contact?.email} />
      <LeadTitleValue title="Phone #:" value={lead.contact?.phone} />
      <LeadTitleValue title="Lead type:" value={lead.personType} />
      <LeadTitleValue title="Buisness:" value={lead.buisness} />
      <LeadTitleValue title="Website:" value={lead.website} />
    </div>
  );
};
