
export type ComparatorResult = -1 | 0 | 1;
export type Comparator<T> = (a: T, b: T) => ComparatorResult;

const COMPARATOR_RESULT_FLIPPER: [1, 0, -1] = [1, 0, -1];
function reversed<T>(comparator: Comparator<T>): Comparator<T> {
  return (a: T, b: T) => COMPARATOR_RESULT_FLIPPER[comparator(a, b) + 1];
}

export function bigints(a: bigint, b: bigint): ComparatorResult {
  return a > b ? 1 : a < b ? -1 : 0;
}

bigints.descending = reversed(bigints);

export function numbers(a: number, b: number): ComparatorResult {

  return a > b ? 1 : a < b ? -1 : 0;
}

numbers.descending = reversed(numbers);
