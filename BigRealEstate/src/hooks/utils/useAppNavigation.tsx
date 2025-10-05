import { useLocation, useNavigate } from "react-router";

export const useAppNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const toHomePage = () => navigate("/home");

  const toTeamPage = () => navigate("/team");

  const toProjectPage = () => navigate("/project");

  const toArtifactsPage = () => navigate("/artifacts");

  return {
    location,
    navigate,

    toHomePage,
    toTeamPage,
    toProjectPage,
    toArtifactsPage,
  };
};
