import { useEffect, useState } from "react";
import { useSideNavControlStore, useSearchFilterStore } from "../../../stores";

export const useSearchLeadFilterSidenav = () => {
  const closeSideNav = useSideNavControlStore((state) => state.close);
  const {
    sortBy: globalSortBy,
    setSortBy: setGlobalSortBy,
  } = useSearchFilterStore();

  const [sortBy, setSortBy] = useState(globalSortBy);

  useEffect(() => {
    setSortBy(globalSortBy);
  }, [globalSortBy]);

  const applyControls = () => {
    setGlobalSortBy(sortBy);
    closeSideNav();
  };

  return {
    closeSideNav,
    sortBy,
    setSortBy,
    applyControls,
  };
};
