import React, { useRef } from "react";
import { IconButton, IconButtonVariant } from "../buttons";
import { Icons } from "../icons";
import clsx from "clsx";
import { useOnKeyPress, type UseOnKeyPressProps } from "../../hooks";
import { Label } from "./Label";

type TextInputProps = {
  value?: string;
  setValue?: (v: string) => void;

  icon?: Icons;
  iconVariant?: IconButtonVariant;
  onIconPress?: () => void;

  label?: string;
  placeholder?: string;

  onKeyPressProps?: UseOnKeyPressProps;
};

export const TextInput = ({
  label,
  placeholder,
  value,
  setValue,

  icon,
  iconVariant = IconButtonVariant.Secondary,
  onIconPress,

  onKeyPressProps = {},
}: TextInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyPress = useOnKeyPress(onKeyPressProps);

  const onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => setValue && setValue(value);

  return (
    <div
      className={clsx(
        "flex flex-row relative rounded-[15px] border-2 box-shadow-sm",
        "bg-white border-secondary focus-within:border-accent"
      )}
    >
      <input
        ref={inputRef}
        className={clsx(
          "peer flex-1 outline-none text-xl rounded-[15px]",
          "px-2.5 cursor-text",
          "focus:outline-none"
        )}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyPress}
      />

      <div
        className={clsx(
          "flex items-center justify-end py-2 pr-2.5",
          icon ? "" : "opacity-0"
        )}
      >
        <IconButton
          name={icon ?? Icons.Search}
          scale={1}
          variant={iconVariant}
          onClick={onIconPress}
        />
      </div>

      {label && <Label label={label} />}

      <div className="absolute top-0 left-0 bottom-0 right-0 pointer-events-none bg-secondary opacity-0 peer-hover:opacity-5"></div>
    </div>
  );
};
