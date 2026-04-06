import { IMAGES } from "../../assets";
import { TutorialSequenceMaximums } from "../../config";
import {
  useAppHeader,
  useAppHeaderHighlightComponents,
  useShouldShowTutorial,
} from "../../hooks";
import { TutorialPage, useTutorialStore } from "../../stores";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { TextInput } from "../inputs";
import { NotificationBell } from "./NotificationBell";

/**
 * The header of the app once you log in. Includes the search bar and top buttons.
 *
 * @returns {AppHeader}
 */
export const AppHeader = () => {
  const {
    query,
    sideNavIcon,
    setQuery,
    toLeadSearchPage,
    onSearchClick,
    onSidenavBtn,
    toDashboard,
    openLeaderBoardModal,
  } = useAppHeader();

  const { tutorial } = useTutorialStore();
  const {
    refs: { searchBarRef },
    highlightComponentDims,
    highlightComponentDimsChange,
  } = useAppHeaderHighlightComponents();
  useShouldShowTutorial({
    page: TutorialPage.Navbar,
    highlightComponentDims,
    highlightComponentDimsChange,
    components: [
      () => (
        <TextInput
          placeholder="Search by city and state/zip eg. Buffalo NY"
          value={query}
          icon={Icons.Search}
          iconVariant={IconButtonVariant.Accent}
        />
      ),
    ],
    forceWait: !(
      tutorial?.map_step === 1 &&
      tutorial.navbar_step <= TutorialSequenceMaximums.navbar
    ),
  });

  return (
    <div className="w-full z-101 flex flex-row items-center justify-between p-4 px-25 bg-primary box-shadow space-x-10">
      <div>
        <button
          className="text-5xl font-bold cursor-pointer grenze"
          onClick={toDashboard}
        >
          <img className="min-w-25 w-25" src={IMAGES.ZalaBlackLogo} />
        </button>
      </div>

      <div className="flex flex-row items-center space-x-4">
        <IconButton name={Icons.Leaderboard} onClick={openLeaderBoardModal} />

        <div className="flex-1 h-full">
          <TextInput
            ref={searchBarRef}
            placeholder="Search by city and state/zip eg. Buffalo NY"
            value={query}
            setValue={setQuery}
            icon={Icons.Search}
            iconVariant={IconButtonVariant.Accent}
            onIconPress={onSearchClick}
            onKeyPressProps={{ Enter: onSearchClick }}
          />
        </div>
      </div>

      <div className="flex flex-row items-center space-x-4">
        <NotificationBell />
        <IconButton name={Icons.Map} onClick={toLeadSearchPage} />
        <IconButton name={Icons.Dashboard} onClick={toDashboard} />
        <IconButton name={sideNavIcon} onClick={onSidenavBtn} />
      </div>
    </div>
  );
};
