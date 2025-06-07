// src/types/group-by.d.ts
declare module 'group-by' {
  type Grouped<T> = Record<string, T[]>;

  function groupBy<T>(
    array: T[],
    keyOrFn: string | ((item: T) => string),
  ): Grouped<T>;

  export default groupBy;
}
