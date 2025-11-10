export type ISourceResult<T> = {
  source: string;
  distanceMiles: number;
} & T;
