import { useEffect } from "react";

export const useTimeoutEffect = (
  cb: () => void,
  deps: unknown[],
  delay: number = 250
) => {
  useEffect(() => {
    const timeout = setTimeout(cb, delay);
    return () => {
      clearTimeout(timeout);
    };
  }, deps);
};
