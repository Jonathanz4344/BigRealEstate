import type { DemoDataSource } from "../../interfaces";

export type APIResponse<T> = {
  data: T | null;
  err: string | null;
};

export type SearchLeadsProps = {
  query: string;
  source: DemoDataSource;
};
