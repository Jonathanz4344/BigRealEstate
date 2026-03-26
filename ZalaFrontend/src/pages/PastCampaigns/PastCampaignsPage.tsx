import { CampaignCard, ModalHeader } from "../../components";
import { usePastCampaignsPage } from "../../hooks";
import { LoadingPage } from "../Loading";
import transition from "../../utils/transitions/transition";

export const PastCampaignsPage = transition(() => {
  const { campaigns, loading, toCampaignPage } = usePastCampaignsPage();
  return loading ? (
    <LoadingPage />
  ) : (
    <div className="flex flex-1 flex-col px-[60px] space-y-[30px]">
      <div className="w-full pt-[15px]">
        <ModalHeader
          title="My Campaigns"
          actions={
            [
              // {
              //   side: "right",
              //   type: "iconBtn",
              //   iconBtnProps: { name: Icons.Add, onClick: onAddNewBoardBtn },
              // },
            ]
          }
        />
      </div>
      <div className="pt-[30px] flex flex-row flex-wrap space-y-[35px] items-center justify-between">
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
});
