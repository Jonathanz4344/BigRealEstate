import { CampaignCard } from "../../components";
import { usePastCampaignsPage } from "../../hooks";
import { LoadingPage } from "../Loading";

export const PastCampaignsPage = () => {
  const { campaigns, loading, toCampaignPage } = usePastCampaignsPage();
  return loading ? (
    <LoadingPage />
  ) : (
    <div className="flex flex-1 flex-col p-[60px] space-y-[30px]">
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-secondary">My Campaigns</h2>
      </div>
      <div className="flex flex-row flex-wrap space-y-[35px] items-center justify-between">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.campaignId}
            campaign={campaign}
            onClick={() => toCampaignPage(campaign.campaignId)}
          />
        ))}
      </div>
    </div>
  );
};
