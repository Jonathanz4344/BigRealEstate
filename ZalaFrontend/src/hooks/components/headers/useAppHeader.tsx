import type { DemoDataSource } from "../../../interfaces";
import {
  useSideNavControlStore,
  useSearchQueryStore,
  useSearchFilterStore,
} from "../../../stores";
import { useApi } from "../../api";
import { useAppNavigation } from "../../utils";

export const useAppHeader = () => {
  const { location, toLeadSearchPage } = useAppNavigation();
  const openSideNav = useSideNavControlStore((state) => state.open);
  const { query, setData, setQuery } = useSearchQueryStore();
  const { source } = useSearchFilterStore();

  const { searchLeads } = useApi();

  const onSearchClick = async () => {
    if (query.length === 0) return; // TODO: Add error message

    if (location.pathname != "/") toLeadSearchPage();

    await onSearchCore(query, source);
  };

  const onSearchCore = async (q: string, s: DemoDataSource) => {
    const { data, err } = await searchLeads({ query: q, sources: [s] });

    if (err || !data) {
      console.log("API Error:");
      console.log(err);
      return; // TODO: Add error message
    }

    setData(data.nearby_properties);
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
