import { useState } from "react";

export const useBoolean = (
  initial: boolean = false
): [boolean, () => void, () => void, () => void] => {
  const [isOpen, setIsOpen] = useState(initial);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);
  return [isOpen, open, close, toggle];
};
