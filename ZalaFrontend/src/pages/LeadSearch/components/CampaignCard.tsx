import { Button, Icons } from "../../../components";

type CampaignCardProps = {
  campaignLeads: number;
  title: string;
  setTitle: (v: string) => void;
  onStart: () => void;
};

export const CampaignCard = ({
  campaignLeads,
  title,
  setTitle,
  onStart,
}: CampaignCardProps) => {
  const onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLTextAreaElement>) => setTitle(value);
  return (
    <div className="bg-white rounded-[15px] p-[15px] w-full">
      <span className="block w-full text-center font-bold text-base ">
        Campaign
      </span>
      <textarea
        className="text-area-style max-h-12"
        placeholder="Campaign title"
        value={title}
        onChange={onChange}
      />
      <div className="flex flex-row items-center justify-between mb-[15px]">
        <span className="text-secondary-50">Leads:</span>
        <span className="text-secondary-50">{campaignLeads}</span>
      </div>
      <Button
        text="Start"
        icon={Icons.Flag}
        disabled={campaignLeads === 0}
        onClick={onStart}
      />
    </div>
  );
};
