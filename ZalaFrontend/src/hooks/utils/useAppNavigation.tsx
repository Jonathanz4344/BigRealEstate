import { useLocation, useNavigate } from "react-router";

export const useAppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const toLeadSearchPage = () => navigate("/");

  const toCampaignPage = (campaignId: number) =>
    navigate("/campaign/" + campaignId);

  const toLoginPage = () => navigate("/login");

  const toSignupPage = () => navigate("/signup");

  const toEmailTestPage = () => navigate("/email-test");

  return {
    location,
    navigate,

    toLeadSearchPage,
    toCampaignPage,
    toLoginPage,
    toSignupPage,
    toEmailTestPage,
  };
};
