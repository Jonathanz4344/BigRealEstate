import type { DemoDataSource } from "../../interfaces";
import { Button, IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { Select } from "../inputs";
import { useSearchLeadFilterSidenav } from "../../hooks";

export const SearchLeadFilterSidenav = () => {
  const {
    globalSource,
    setGlobalSource,
    sortBy,
    setSortBy,
    closeSideNav,
    applyControls,
  } = useSearchLeadFilterSidenav();
  return (
    <div className="w-full h-full flex flex-col space-y-[30px]">
      <div className="w-full flex flex-col flex-1 space-y-[30px] overflow-y-scroll p-[30px]">
        <div className="relative flex flex-row items-center justify-start">
          <div className="absolute top-0 left-0 h-full w-full flex items-center justify-center">
            <p className="text-xl font-bold">Lead Controls</p>
          </div>
          <IconButton
            variant={IconButtonVariant.Secondary}
            name={Icons.Close}
            onClick={closeSideNav}
            scale={0.85}
            borderRadius={10}
            shadow={false}
          />
          <p className="opacity-0 text-xl font-bold">Lead Controls</p>
        </div>
        <Select
          label="Lead source"
          value={globalSource}
          setValue={(v) => setGlobalSource(v as DemoDataSource)}
          includeEmptyEnding={false}
          options={[
            { value: "gpt" },
            { value: "rapidapi" },
            { value: "google" },
          ]}
        />
        <Select
          label="Sort by"
          value={sortBy}
          setValue={setSortBy}
          includeEmptyEnding={false}
          options={[
            { value: "None" },
            { value: "Name" },
            { value: "Email" },
            { value: "Address" },
          ]}
        />
      </div>

      <div className="p-[30px]">
        <Button text="Apply Controls" onClick={applyControls} />
      </div>
    </div>
  );
};
