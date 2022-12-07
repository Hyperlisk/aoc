
import * as virtual from "./virtual.js";

type _ZERO = 0;
type _ONE = 1;
type _TWO = 2;
type _THREE = 3;
type TupleOf<T, N extends number> =
  N extends _ZERO
    ? T[] & { length: 0 }
    : N extends _ONE
      ? [T]
      : N extends _TWO
        ? [T, T]
        : N extends _THREE
          ? [T, T, T]
          : never;

export function chunk<T, N extends number>(input: Array<T>, chunkSize: N): Array<TupleOf<T, N>> {
  const result = [];
  for (let i = 0;i < input.length;i += chunkSize) {
    result.push(input.slice(i, i + chunkSize));
  }
  return result;
};

export function intersection<T>(first: Array<T>, ...rest: Array<Array<T>>): Array<T> {
  function intersect2<T>(a: Array<T>, b: Array<T>): Array<T> {
    const seen: Set<T> = new Set(a);
    const results: Set<T> = new Set();
    b.forEach(item => {
      if (seen.has(item)) {
        results.add(item);
      }
    });
    return Array.from(results);
  }
  return rest.reduce(intersect2, first);
};

type RangeOptions = {
  inclusive?: boolean,
};

export function range(start: number, end: number, options?: RangeOptions): Array<number> {
  const { inclusive } = {
    // Override with user-specified options.
    ...options,
  };
  const length = end - start + (inclusive ? 1 : 0)
  return virtual.array((idx) => start + idx, length);
}

range.inclusive = function rangeInclusive(start: number, end: number, options: Exclude<RangeOptions, 'inclusive'>) {
  return range(start, end, {
    inclusive: true,
    ...options,
  });
};

export function reverse<T>(input: Array<T>): Array<T> {
  return virtual.array((idx) => input[input.length - idx - 1], input.length);
}

export function sum(input: Array<number>): number {
  return input.reduce((total, n) => total + n, 0);
};

export function zip<T>(...arrays: Array<Array<T>>): Array<Array<T>> {
  const [first, ...additionalArrays] = arrays;
  const results: Array<Array<T>> = first.map(firstItem => [firstItem]);
  additionalArrays.forEach(additionalArray => {
    if (additionalArray.length !== first.length) {
      throw new Error(`Can not zip arrays with different length: ${additionalArray.length} !== ${first.length}`);
    }
    additionalArray.forEach((item, resultIdx) => {
      results[resultIdx].push(item);
    });
  });
  return results;
}

type ArrayWithLength<T, Length extends number> = Array<T> & { length: Length };

export function window<T, Length extends number>(input: Array<T>, windowSize: Length): Array<ArrayWithLength<T, Length>> {
  return virtual.array<T>(
    (windowIdx) => {
      if (windowIdx < 0 || windowIdx >= input.length - windowSize) {
        return undefined;
      }
      return virtual.array<T>((windowItemIdx) => input[windowIdx + windowItemIdx], windowSize);//input.slice(idx, idx + windowSize);
    },
    input.length - windowSize + 1,
  );
};
