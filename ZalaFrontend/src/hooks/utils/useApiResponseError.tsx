import { useSnack } from "./useSnack";

type OnErrorOptions = {
  msg?: string;
  showSnack?: boolean;
};

const DEFAULT_OPTIONS: OnErrorOptions = {
  msg: "Connection error... please try again later",
  showSnack: true,
};

export const useApiResponseError = () => {
  const [_, errorSnack] = useSnack();
  const onError = (
    where: string,
    err: string | null,
    options: OnErrorOptions = DEFAULT_OPTIONS
  ) => {
    if (options.showSnack && options.msg) errorSnack(options.msg);
    console.log(`Internal error${where.length > 0 ? " " + where : ""}: `);
    console.log(err);
    console.log("");
  };
  return onError;
};
