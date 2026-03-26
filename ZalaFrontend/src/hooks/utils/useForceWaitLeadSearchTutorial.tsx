import { useState } from "react";
import { useTutorialStore } from "../../stores";
import { TutorialSequenceMaximums } from "../../config";
import { useTimeoutEffect } from "./useTimeoutEffect";

type UseForceWaitLeadSearchTutorial = {
  showLeads: boolean;
};

export const useForceWaitLeadSearchTutorial = ({
  showLeads,
}: UseForceWaitLeadSearchTutorial) => {
  const tutorialStore = useTutorialStore();

  const [shouldForceWait, setShouldForceWait] = useState(true);

  useTimeoutEffect(
    () => {
      setShouldForceWait(shouldWait());
    },
    [
      showLeads,
      tutorialStore.tutorial?.map_step,
      tutorialStore.tutorial?.navbar_step,
    ],
    250,
  );

  const shouldWait = () => {
    const tutorial = tutorialStore.tutorial;

    if (!tutorial) return true;
    if (tutorial.map_step > TutorialSequenceMaximums.search) return true;

    if (tutorial.map_step === 0 || tutorial.map_step === 2) return false;

    if (
      tutorial.map_step === 1 &&
      showLeads &&
      tutorial.navbar_step > TutorialSequenceMaximums.navbar
    )
      return false;

    return true;
  };

  return shouldForceWait;
};
