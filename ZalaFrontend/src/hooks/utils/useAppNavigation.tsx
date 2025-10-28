import { useLocation, useNavigate } from "react-router";

export const useAppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const toLeadSearchPage = () => navigate("/");

  const toCampaignPage = (campaignId: number) =>
    navigate("/campaign/" + campaignId);

  return {
    location,
    navigate,

    toLeadSearchPage,
    toCampaignPage,
  };
};
