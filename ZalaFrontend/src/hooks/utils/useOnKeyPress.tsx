import React from "react";

export type UseOnKeyPressProps = {
  [key: string]: () => void;
};

export const useOnKeyPress = (keys: UseOnKeyPressProps = {}) => {
  const onKeyPress = (event: React.KeyboardEvent) => {
    for (const key in keys) {
      if (event.key.toLowerCase() === key.toLowerCase()) {
        const method = keys[key];
        method();
      }
    }
  };
  return onKeyPress;
};
