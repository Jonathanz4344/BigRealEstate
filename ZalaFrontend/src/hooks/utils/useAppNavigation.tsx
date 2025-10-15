import { useLocation, useNavigate } from "react-router";

export const useAppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const toLeadSearchPage = () => navigate("/");

  return {
    location,
    navigate,

    toLeadSearchPage,
  };
};
