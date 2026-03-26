import { TutorialSequenceMaximums, type TutorialTextKey } from "../../config";
import type { ITutorial } from "../../interfaces";
import { TutorialPage } from "../../stores";

export const useTutorialPageTo = () => {
  const pageToTutorialKey = (
    page: TutorialPage,
  ): keyof Omit<Omit<ITutorial, "user_id">, "tutorial_id"> | undefined => {
    switch (page) {
      case TutorialPage.Dashboard:
        return "dashboard_step";
      case TutorialPage.Search:
        return "map_step";
      case TutorialPage.Campaign:
        return "campaign_step";
      case TutorialPage.Navbar:
        return "navbar_step";
      case TutorialPage.Board:
        return "board_step";
      default:
        return undefined;
    }
  };

  // Gives max index value (zero based)
  const pageToMaxTutorialStep = (page: TutorialPage) => {
    return TutorialSequenceMaximums[page.toLowerCase() as TutorialTextKey];
  };

  return {
    pageToTutorialKey,
    pageToMaxTutorialStep,
  };
};
