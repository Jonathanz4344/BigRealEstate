import type { DemoDataSource } from "../../interfaces";
import { Button, IconButton, IconButtonVariant } from "../buttons";
import { Icon, Icons } from "../icons";
import { Select } from "../inputs";
import { useSearchLeadFilterSidenav } from "../../hooks";
import { COLORS } from "../../config";

const SOURCE_OPTIONS: { value: DemoDataSource; text: string }[] = [
  { value: "rapidapi", text: "RapidAPI (Zillow)" },
  { value: "google_places", text: "Google Places" },
  { value: "gpt", text: "OpenAI" },
  { value: "db", text: "Database" },
  { value: "mock", text: "Mock Data" },
];

export const SearchLeadFilterSidenav = () => {
  const {
    selectedSources,
    toggleSource,
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
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">
            Lead sources
          </p>
          <div className="flex flex-col space-y-2">
            {SOURCE_OPTIONS.map(({ value, text }) => {
              const isSelected = selectedSources.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleSource(value)}
                  className={`flex w-full items-center space-x-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? "border-transparent shadow-sm"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                  style={isSelected ? { backgroundColor: COLORS.primary } : undefined}
                >
                  <Icon
                    name={
                      isSelected ? Icons.CheckboxChecked : Icons.CheckboxOutline
                    }
                    color={isSelected ? COLORS.accent : COLORS.secondary50}
                  />
                  <span className="text-sm font-medium text-neutral-800">
                    {text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
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
