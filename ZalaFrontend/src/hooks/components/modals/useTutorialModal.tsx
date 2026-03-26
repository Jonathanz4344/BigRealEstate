import { useApi, useUserTutorial } from "../../api";
import {
  GlobalModalPage,
  TutorialPage,
  useAuthStore,
  useGlobalModalStore,
  useTutorialStore,
} from "../../../stores";
import { useEffect, useState } from "react";
import {
  useAppLocation,
  useAppNavigation,
  useOnTutorialModalChange,
  useTutorialPageTo,
} from "../../utils";
import type { ITutorial } from "../../../interfaces";
import {
  TutorialSequence,
  TutorialSequenceMaximums,
  TutorialText,
  type TutorialTextKey,
} from "../../../config";

export const useTutorialModal = ({
  onClose = () => {},
  fireOnChange = false,
}: {
  onClose?: () => void;
  fireOnChange?: boolean;
}) => {
  const { user } = useAuthStore();
  const globalModalStore = useGlobalModalStore();
  const tutorialStore = useTutorialStore();

  const api = useApi();
  const { pageToTutorialKey } = useTutorialPageTo();
  const { isSearchPage } = useAppLocation();

  useUserTutorial({ userId: user?.userId, setToStore: true });

  const [step, setStep] = useState(-1);
  const [tutorialText, setTutorialText] = useState("");

  const [fireToNextTutorial, setFireToNextTutorial] = useState(false);
  const [fireSkipNextTutorial, setFireSkipNextTutorial] = useState(false);

  const onTutorialChange = useOnTutorialModalChange();
  const appNavigation = useAppNavigation();

  useEffect(() => {
    const key = pageToTutorialKey(tutorialStore.page);
    if (!key || !tutorialStore.tutorial) return;
    setStep(tutorialStore.tutorial[key]);
  }, [tutorialStore.tutorial?.tutorial_id, tutorialStore.page]);

  useEffect(() => {
    if (step === -1) return;
    const text =
      TutorialText[tutorialStore.page.toLowerCase() as TutorialTextKey][step];

    setTutorialText(text);
  }, [tutorialStore.page, step]);

  useEffect(() => {
    if (!fireToNextTutorial) return;
    toNextTutorialPage();
  }, [fireToNextTutorial]);

  useEffect(() => {
    if (!fireSkipNextTutorial) return;
    const nextPage = getNextPage();
    if (nextPage) (async () => await updateUserTutorial(-1, nextPage, -1))();
    onClose();
  }, [fireSkipNextTutorial]);

  const updateUserTutorial = async (
    addTo: number,
    page = tutorialStore.page,
    setTo?: number,
  ) => {
    const key = pageToTutorialKey(page);

    if (!tutorialStore.tutorial || !key) return;

    const newTut: ITutorial = { ...tutorialStore.tutorial };

    const newValue =
      setTo !== undefined ? setTo : tutorialStore.tutorial[key] + addTo;
    newTut[key] = newValue;

    const res = await api.updateUserTutorial(newTut);

    if (res.err || !res.data) return;

    tutorialStore.setTutorial(res.data);
    setStep(newValue);

    if (fireOnChange) onTutorialChange(newValue);
  };

  const getNextPage = () => {
    let nextPage = undefined;

    switch (tutorialStore.page) {
      case TutorialPage.Dashboard:
        nextPage = TutorialPage.Search;
        break;
      // case TutorialPage.Navbar:
      //   nextPage = TutorialPage.Search;
      //   break;
      case TutorialPage.Search:
        nextPage = TutorialPage.Campaign;
        break;
      case TutorialPage.Campaign:
      default:
        break;
    }

    return nextPage;
  };

  const toNextTutorialPage = () => {
    setFireToNextTutorial(false);

    const nextPage = getNextPage();

    if (nextPage === TutorialPage.Search && !isSearchPage) {
      return (onClose(), appNavigation.toLeadSearchPage());
    }

    if (!nextPage) return onClose();
    if (!tutorialStore.tutorial) return;

    const tutorialStepKey = pageToTutorialKey(nextPage);

    if (!tutorialStepKey) return;

    const modalType =
      TutorialSequence[nextPage.toLowerCase() as TutorialTextKey][0];
    const globalPage =
      modalType === "modal"
        ? GlobalModalPage.TutorialModal
        : GlobalModalPage.HighlightComponentModal;

    tutorialStore.setPage(nextPage);
    setStep(tutorialStore.tutorial[tutorialStepKey]);
    globalModalStore.setPage(globalPage);
  };

  const isFinalStep = (page: TutorialPage) => {
    const key = pageToTutorialKey(page);
    if (!key || !tutorialStore.tutorial) return false;

    return (
      tutorialStore.tutorial[key] ===
      TutorialSequenceMaximums[page.toLowerCase() as TutorialTextKey]
    );
  };

  const nextTutorial = async () => {
    switch (tutorialStore.page) {
      case TutorialPage.Campaign:
      case TutorialPage.Search:
        await updateUserTutorial(1, tutorialStore.page);
        onClose();
        break;
      default:
        if (isFinalStep(tutorialStore.page)) {
          await updateUserTutorial(1);
          setFireToNextTutorial(true);
          return;
        }

        await updateUserTutorial(1);
        break;
    }
  };

  // Never used so far
  const backTutorial = async () => {
    await updateUserTutorial(-1);
  };

  const skipTutorial = async () => {
    if (isFinalStep(tutorialStore.page)) {
      await updateUserTutorial(1);
      setFireSkipNextTutorial(true);
      return;
    }

    await updateUserTutorial(-1, tutorialStore.page, -1);
    onClose();
  };

  return {
    tutorialStore,
    step,
    tutorialText,

    backTutorial,
    nextTutorial,
    skipTutorial,
  };
};
