import { useLocation, useNavigate } from "react-router";
import type { ILead } from "../../interfaces";

export const useAppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const toLeadSearchPage = () => navigate("/");

  const toCampaignPage = (campaignId: number, leads: ILead[]) =>
    navigate("/campaign/" + campaignId, { state: { leads } });

  const toLoginPage = () => navigate("/login");

  const toSignupPage = () => navigate("/signup");

  const toNotFound = () => navigate("/404");

  return {
    location,
    navigate,

    toLeadSearchPage,
    toCampaignPage,
    toLoginPage,
    toSignupPage,
    toNotFound,
  };
};
