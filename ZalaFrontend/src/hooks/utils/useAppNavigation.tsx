import { useLocation, useNavigate } from "react-router";

export const useAppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const toLeadSearchPage = () => navigate("/");

  const toCampaignPage = (campaignId: number) =>
    navigate("/campaign/" + campaignId);

  const toBoardsPage = () => navigate("/boards");

  const toLoginPage = () => navigate("/login");

  const toSignupPage = () => navigate("/signup");

  return {
    location,
    navigate,

    toLeadSearchPage,
    toBoardsPage,
    toCampaignPage,
    toLoginPage,
    toSignupPage,
  };
};
