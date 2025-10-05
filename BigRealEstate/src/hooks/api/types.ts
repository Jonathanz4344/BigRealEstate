export type APIResponse<T> = {
  data: T | null;
  err: string | null;
};
