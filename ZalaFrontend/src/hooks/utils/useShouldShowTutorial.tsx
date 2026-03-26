import { useUserTutorial } from "../api";
import {
  GlobalModalPage,
  TutorialPage,
  useAuthStore,
  useGlobalModalStore,
  useHighlightComponentStore,
  useTutorialStore,
} from "../../stores";
import { useTutorialPageTo } from "./useTutorialPageTo";
import {
  TutorialSequence,
  TutorialTextPlacements,
  type TutorialTextKey,
} from "../../config";
import type { IHighlightComponentDims } from "./types";
import { useTimeoutEffect } from "./useTimeoutEffect";
import { stringify } from "../../utils";
import type { ReactNode } from "react";
import { useAppLocation } from "./useAppLocation";

type UseShouldShowTutorial = {
  page: TutorialPage;
  highlightComponentDims: (IHighlightComponentDims | null)[];
  highlightComponentDimsChange: number[];
  components: ((() => ReactNode) | null)[];
  deps?: unknown[];
  forceWait?: boolean;
};

export const useShouldShowTutorial = ({
  page,
  highlightComponentDims,
  highlightComponentDimsChange,
  components,
  deps = [],
  forceWait,
}: UseShouldShowTutorial) => {
  const { user } = useAuthStore();
  const tutorialStore = useTutorialStore();
  const globalModalStore = useGlobalModalStore();
  const highlightComponentStore = useHighlightComponentStore();

  useUserTutorial({
    userId: user?.userId,
    setToStore: true,
  });

  const { pageToMaxTutorialStep, pageToTutorialKey } = useTutorialPageTo();

  const { pathname } = useAppLocation();

  useTimeoutEffect(
    () => {
      if (forceWait) return;
      shouldShowTutorialForPage();
    },
    [
      forceWait,
      pathname,
      globalModalStore.page,
      tutorialStore.page,
      stringify(tutorialStore.tutorial),
      stringify(highlightComponentDimsChange),
      ...deps,
    ],
    250,
  );

  const shouldShowTutorialForPage = (): 0 | 1 | 2 => {
    const key = pageToTutorialKey(page);
    if (!key || !tutorialStore.tutorial) return 0;

    const tutorialStep = tutorialStore.tutorial[key];
    const maxTutorialStep = pageToMaxTutorialStep(page);

    if (tutorialStep === -1 || tutorialStep > maxTutorialStep) return 0;

    const modalType =
      TutorialSequence[page.toLowerCase() as TutorialTextKey][tutorialStep];

    highlightComponentStore.setHighlightComponentDims(highlightComponentDims);
    highlightComponentStore.setComponents(components);
    highlightComponentStore.setTextPlacement(
      TutorialTextPlacements[page.toLowerCase() as TutorialTextKey],
    );

    if (
      globalModalStore.isOpen &&
      (globalModalStore.page === GlobalModalPage.HighlightComponentModal ||
        globalModalStore.page === GlobalModalPage.TutorialModal)
    )
      return 1;

    tutorialStore.setPage(page);
    globalModalStore.setListener("postClose", () => {
      highlightComponentStore.setHighlightComponentDims([]);
      highlightComponentStore.setComponents([]);

      globalModalStore.setPage(GlobalModalPage.None);
      globalModalStore.clearListeners();
    });
    globalModalStore.setPage(
      modalType === "modal"
        ? GlobalModalPage.TutorialModal
        : GlobalModalPage.HighlightComponentModal,
    );
    globalModalStore.setIsOpen(true);

    return 2;
  };
};
