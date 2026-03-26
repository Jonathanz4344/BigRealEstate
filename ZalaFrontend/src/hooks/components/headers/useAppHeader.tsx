import { Icons } from "../../../components";
import {
  useSideNavControlStore,
  useSearchQueryStore,
  SideNavControlVariant,
  useGlobalModalStore,
  GlobalModalPage,
} from "../../../stores";
import { useApi } from "../../api";
import { useAppNavigation } from "../../utils";

export const useAppHeader = () => {
  const {
    location,
    toLeadSearchPage,
    toBoardsPage,
    // toBoardsV2Page,
    toDashboard,
  } = useAppNavigation();

  const {
    open: openSideNav,
    close: closeSideNav,
    isOpen,
  } = useSideNavControlStore();
  const { query, setData, setNearbyProperties, setQuery, setLoading } = useSearchQueryStore();

  const globalModalStore = useGlobalModalStore();

  const { searchLeads } = useApi();

  const sideNavIcon = isOpen ? Icons.Close : Icons.Menu;

  const onSearchClick = async () => {
    if (query.length === 0) return; // TODO: Add error message

    if (location.pathname != "/") toLeadSearchPage();

    await onSearchCore(query);
  };

  const onSearchCore = async (q: string) => {
    closeSideNav();
    setLoading(true);
    try {
      const { data, err } = await searchLeads({ query: q });

      if (err || !data) {
        console.log("API Error:");
        console.log(err);
        return; // TODO: Add error message
      }

      setData(data.nearby_properties);
      setNearbyProperties(data.nearbyPropertyPins ?? []);
    } finally {
      setLoading(false);
    }
  };

  const onSidenavBtn = () =>
    isOpen ? closeSideNav() : openSideNav(SideNavControlVariant.None);

  const openLeaderBoardModal = () => {
    globalModalStore.setPage(GlobalModalPage.LeaderBoardGlobal);
    globalModalStore.toggleOpen();

    globalModalStore.setListener("preClose", () => {
      globalModalStore.setPage(GlobalModalPage.None);
    });
  };

  return {
    query,
    sideNavIcon,
    setQuery,
    toLeadSearchPage,
    toBoardsPage,
    openSideNav,
    onSearchClick,
    onSearchCore,
    onSidenavBtn,
    openLeaderBoardModal,
    toDashboard,
  };
};
