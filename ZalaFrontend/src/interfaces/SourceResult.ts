export type ASourceResult<T> = {
  // source: string;
  distance_miles: number;
} & T;

export type ISourceResult<T> = {
  // source: string;
  distanceMiles: number;
} & T;
