import clsx from "clsx";

import { Icons } from "../icons";
import { IconButton } from "../buttons";
import { Label } from "./Label";

type SelectOption = {
  value: string;
  text?: string;
};

type SelectProps = {
  value: string;
  setValue: (v: string) => void;

  label?: string;
  placeHolder?: string;
  includeEmptyEnding?: boolean;

  options: SelectOption[];
};

export const Select = ({
  value,
  setValue,
  placeHolder,
  includeEmptyEnding = true,
  label,
  options,
}: SelectProps) => {
  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    e.currentTarget.blur();
  };
  return (
    <div
      className={clsx(
        "w-full flex flex-row relative rounded-[15px] border-2 box-shadow-sm",
        "bg-white border-secondary focus-within:border-accent"
      )}
    >
      <div className="py-2 pl-2.5 opacity-0">
        <IconButton name={Icons.Flag} />
      </div>
      <div className="absolute w-full h-full top-0 left-0 pr-2.5">
        <select
          value={value}
          onChange={onChange}
          className={clsx(
            "peer w-full h-full focus:outline-none text-xl pl-2.5 cursor-pointer"
          )}
        >
          {includeEmptyEnding && <option value="">{placeHolder}</option>}
          {options.map((val) => (
            <option key={val.value} value={val.value}>
              {val.text ?? val.value}
            </option>
          ))}
        </select>
        {label && <Label active={value.length > 0} label={label} />}
      </div>
    </div>
  );
};
