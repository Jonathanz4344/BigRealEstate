import clsx from "clsx";
import { SideNavControlVariant, useSideNavControlStore } from "../../stores";
import { SearchLeadFilterSidenav } from "./SearchLeadFilterSidenav";

export const Sidenav = () => {
  const { isOpen, variant } = useSideNavControlStore();

  const Component =
    variant === SideNavControlVariant.LeadFilters
      ? SearchLeadFilterSidenav
      : () => <div>The None component</div>;

  return (
    <div
      className={clsx(
        "absolute z-5 top-0 left-0 bottom-0 w-[35vw] max-w-[35vw] transition-[translate] duration-[250ms] overflow-hidden",
        "box-shadow  bg-[var(--color-background)]",
        isOpen ? "" : "translate-x-[-100%]"
      )}
    >
      <Component />
    </div>
  );
};
