
import * as virtual from "./virtual.js";

export function chunk<T, N extends number>(input: Array<T>, chunkSize: N): Array<Array<T>> {
  const result: Array<Array<T>> = [];
  for (let i = 0;i < input.length;i += chunkSize) {
    result.push(input.slice(i, i + chunkSize));
  }
  return result;
}

export function intersection<T>(first: Array<T>, ...rest: Array<Array<T>>): Array<T> {
  function intersect2<T>(a: Array<T>, b: Array<T>): Array<T> {
    const seen: Set<T> = new Set(a);
    const results: Set<T> = new Set();
    b.forEach((item) => {
      if (seen.has(item)) {
        results.add(item);
      }
    });
    return Array.from(results);
  }
  return rest.reduce(intersect2, first);
}

type RangeOptions = {
  inclusive?: boolean,
};

export function range(start: number, end: number, options?: RangeOptions): Array<number> {
  const { inclusive } = {
    // Override with user-specified options.
    ...options,
  };
  const length = end - start + (inclusive ? 1 : 0);
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
}

export function view<T>(input: Array<T>, start: number, end?: number) {
  const length = end === undefined ? input.length - start : end - start;
  return virtual.array<T>((idx) => input[idx + start], length);
}

export function zip<T>(...arrays: Array<Array<T>>): Array<Array<T>> {
  view(arrays, 1)
    .forEach((additionalArray) => {
      if (additionalArray.length !== arrays[0].length) {
        throw new Error(`Can not zip arrays with different length: ${additionalArray.length} !== ${arrays[0].length}`);
      }
    });
  return virtual.array((colIdx) => virtual.array((rowIdx) => arrays[rowIdx][colIdx], arrays.length), arrays[0].length);
}

export function window<T, Length extends number>(input: Array<T>, windowSize: Length): Array<Array<T>> {
  return virtual.array<Array<T>>(
    (windowIdx) => {
      if (windowIdx < 0 || windowIdx >= input.length - windowSize) {
        return undefined;
      }
      return virtual.array<T>((windowItemIdx) => input[windowIdx + windowItemIdx], windowSize);//input.slice(idx, idx + windowSize);
    },
    input.length - windowSize + 1,
  );
}
