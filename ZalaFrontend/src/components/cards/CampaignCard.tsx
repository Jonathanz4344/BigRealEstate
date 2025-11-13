import clsx from "clsx";
import type { ICampaign } from "../../interfaces";
import { useHover } from "../../hooks";

type CampaignCardProps = {
  campaign: ICampaign;

  onClick?: () => void;
};

export const CampaignCard = ({ campaign, onClick }: CampaignCardProps) => {
  const [_isHovered, hoverProps] = useHover({ onClick });
  const contactedLeads = campaign.leads.filter(
    (lead) => lead.contactMethods.length > 0
  );
  return (
    <div
      {...hoverProps}
      className={clsx(
        "card-base box-shadow flex basis-[30%] flex-col p-[15px] space-y-[15px]",
        "transition-[translate] duration-75 hover:translate-y-[-5px]",
        onClick ? "cursor-pointer" : ""
      )}
    >
      <div>
        <p className="text-xl font-bold">{campaign.campaignName}</p>
        <p className="text-base text-secondary-50">
          {contactedLeads.length} of {campaign.leads.length} Leads Contacted
        </p>
      </div>
      <div className="w-full h-[15px] rounded-[15px] bg-offwhite flex flex-row overflow-hidden">
        {campaign.leads
          .sort((a, b) => b.contactMethods.length - a.contactMethods.length)
          .map((lead) => (
            <div
              style={{ flex: 1 / campaign.leads.length }}
              className={clsx(
                lead.contactMethods.length > 0 ? "bg-accent h-full" : ""
              )}
            />
          ))}
      </div>
    </div>
  );
};
