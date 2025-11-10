import type { DemoDataSource } from "../../../interfaces";
import { useSideNavControlStore, useSearchFilterStore } from "../../../stores";

export const useSearchLeadFilterSidenav = () => {
  const closeSideNav = useSideNavControlStore((state) => state.close);
  const {
    sources: globalSources,
    setSources: setGlobalSources,
    sortBy: globalSortBy,
    setSortBy: setGlobalSortBy,
  } = useSearchFilterStore();

  const toggleSource = (value: DemoDataSource) => {
    setGlobalSources(
      globalSources.includes(value)
        ? globalSources.filter((it) => it !== value)
        : [...globalSources, value]
    );
  };

  const applyControls = () => {
    closeSideNav();
  };

  return {
    closeSideNav,
    selectedSources: globalSources,
    toggleSource,
    sortBy: globalSortBy,
    setSortBy: setGlobalSortBy,
    applyControls,
  };
};
