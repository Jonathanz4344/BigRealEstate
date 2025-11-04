import { useSnackbar } from "notistack";

export const useSnack = (): [(msg: string) => void, (msg: string) => void] => {
  const snackbar = useSnackbar();
  const successMsg = (msg: string) =>
    snackbar.enqueueSnackbar(msg, { variant: "success" });
  const errorMsg = (msg: string) =>
    snackbar.enqueueSnackbar(msg, { variant: "error" });
  return [successMsg, errorMsg];
};
