import { useAppHeader } from "../../hooks";
import { SideNavControlVariant } from "../../stores";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import { TextInput } from "../inputs";

export const AppHeader = () => {
  const { query, setQuery, openSideNav, toLeadSearchPage, onSearchClick } =
    useAppHeader();

  return (
    <div className="w-full z-10 flex flex-row items-center justify-between p-4 px-[100px] bg-[var(--color-primary)] box-shadow">
      <div>
        <p
          className="text-5xl font-bold cursor-pointer grenze"
          onClick={toLeadSearchPage}
        >
          Zala
        </p>
      </div>

      <div className="flex-1 h-full px-10">
        <TextInput
          placeholder="Search by city and state/zip eg. Buffalo NY"
          value={query}
          setValue={setQuery}
          icon={Icons.Search}
          iconVariant={IconButtonVariant.Accent}
          onIconPress={onSearchClick}
          onKeyPressProps={{ Enter: onSearchClick }}
        />
      </div>

      <div className="flex flex-row space-x-4">
        <IconButton name={Icons.Chart} />
        <IconButton name={Icons.User} />
        <IconButton
          name={Icons.Menu}
          onClick={() => openSideNav(SideNavControlVariant.None)}
        />
      </div>
    </div>
  );
};
