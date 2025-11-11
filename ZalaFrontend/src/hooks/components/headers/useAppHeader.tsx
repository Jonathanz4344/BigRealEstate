import { useSideNavControlStore, useSearchQueryStore } from "../../../stores";
import { useApi } from "../../api";
import { useAppNavigation } from "../../utils";

export const useAppHeader = () => {
  const { location, toLeadSearchPage } = useAppNavigation();
  const openSideNav = useSideNavControlStore((state) => state.open);
  const { query, setData, setQuery, setLoading } = useSearchQueryStore();

  const { searchLeads } = useApi();

  const onSearchClick = async () => {
    if (query.length === 0) return; // TODO: Add error message

    if (location.pathname != "/") toLeadSearchPage();

    await onSearchCore(query);
  };

  const onSearchCore = async (q: string) => {
    setLoading(true);
    try {
      const { data, err } = await searchLeads({ query: q });

      if (err || !data) {
        console.log("API Error:");
        console.log(err);
        return; // TODO: Add error message
      }

      setData(data.nearby_properties);
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
