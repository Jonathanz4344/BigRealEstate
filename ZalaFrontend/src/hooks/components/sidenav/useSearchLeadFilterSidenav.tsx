import { useEffect, useState } from "react";
import type { DemoDataSource } from "../../../interfaces";
import {
  DEFAULT_LEAD_SOURCES,
  useSideNavControlStore,
  useSearchFilterStore,
} from "../../../stores";

export const useSearchLeadFilterSidenav = () => {
  const closeSideNav = useSideNavControlStore((state) => state.close);
  const {
    sources: globalSources,
    setSources: setGlobalSources,
    sortBy: globalSortBy,
    setSortBy: setGlobalSortBy,
  } = useSearchFilterStore();

  const [selectedSources, setSelectedSources] =
    useState<DemoDataSource[]>(globalSources);
  const [sortBy, setSortBy] = useState(globalSortBy);

  useEffect(() => {
    setSelectedSources(globalSources);
  }, [globalSources]);

  useEffect(() => {
    setSortBy(globalSortBy);
  }, [globalSortBy]);

  const toggleSource = (value: DemoDataSource) => {
    setSelectedSources((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item !== value);
      return [...prev, value];
    });
  };

  const applyControls = () => {
    const sanitizedSources =
      selectedSources.length > 0 ? selectedSources : DEFAULT_LEAD_SOURCES;
    setGlobalSources(sanitizedSources);
    setGlobalSortBy(sortBy);
    closeSideNav();
  };

  return {
    closeSideNav,
    selectedSources,
    toggleSource,
    sortBy,
    setSortBy,
    applyControls,
  };
};
