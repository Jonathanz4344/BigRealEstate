import type { DemoDataSource } from "../../../interfaces";
import {
  DEFAULT_LEAD_SOURCES,
  useSideNavControlStore,
  useSearchQueryStore,
  useSearchFilterStore,
} from "../../../stores";
import { useApi } from "../../api";
import { useAppNavigation } from "../../utils";

export const useAppHeader = () => {
  const { location, toLeadSearchPage } = useAppNavigation();
  const { open: openSideNav, close: closeSideNav } = useSideNavControlStore();
  const { query, setData, setQuery, setLoading } = useSearchQueryStore();
  const { sources } = useSearchFilterStore();

  const { searchLeads } = useApi();

  const onSearchClick = async () => {
    if (query.length === 0) return; // TODO: Add error message

    if (location.pathname != "/") toLeadSearchPage();

    await onSearchCore(query, sources);
  };

  const onSearchCore = async (
    q: string,
    selectedSources: DemoDataSource | DemoDataSource[]
  ) => {
    const normalizedSources = Array.isArray(selectedSources)
      ? selectedSources
      : [selectedSources];
    const activeSources =
      normalizedSources.length > 0 ? normalizedSources : DEFAULT_LEAD_SOURCES;

    closeSideNav();
    setLoading(true);
    try {
      const { data, err } = await searchLeads({
        query: q,
        sources: activeSources,
      });

      if (err || !data) {
        console.log("API Error:");
        console.log(err);
        return; // TODO: Add error message
      }

      setData(data.nearby_properties);
      console.log(`Leads:`);
      console.log(data.nearby_properties);
      console.log(``);
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    setQuery,
    toLeadSearchPage,
    openSideNav,
    onSearchClick,
    onSearchCore,
  };
};
