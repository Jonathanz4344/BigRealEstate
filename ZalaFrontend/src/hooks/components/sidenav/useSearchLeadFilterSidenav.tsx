import { useState } from "react";
import { useSideNavControlStore, useSearchFilterStore } from "../../../stores";

export const useSearchLeadFilterSidenav = () => {
  const closeSideNav = useSideNavControlStore((state) => state.close);
  const {
    source: globalSource,
    setSource: setGlobalSource,
    sortBy: globalSortBy,
    setSortBy: setGlobalSortBy,
  } = useSearchFilterStore();
  // const [source, setSource] = useState<DemoDataSource>(globalSource);
  const [sortBy, setSortBy] = useState(globalSortBy);
  const applyControls = () => (
    // setGlobalSource(source),
    setGlobalSortBy(sortBy), closeSideNav()
  );
  return {
    closeSideNav,
    globalSource,
    setGlobalSource,
    sortBy,
    setSortBy,
    applyControls,
  };
};
