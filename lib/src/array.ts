
import * as comparator from "./comparator.js";
import * as virtual from "./virtual.js";

export function binary<T>(input: Array<T>, item: T, compare: comparator.Comparator<T> = comparator.generic<T>) {
  let low = 0;
  let high = input.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cmp = compare(item, input[mid]);

    switch (cmp) {
      case -1:
        high = mid - 1;
        break;

      case 0:
        return mid;

      case 1:
        low = mid + 1;
        break;
    }
  }

  return low;
}

binary.insert = function binaryInsert<T>(input: Array<T>, item: T, compare: comparator.Comparator<T> = comparator.generic<T>) {
  const insertIndex = binary(input, item, compare);
  input.splice(insertIndex, 0, item);
  return insertIndex;
};

export function concat<T>(...arrays: Array<Array<T>>): Array<T> {
  const lengths = virtual.array((idx) => arrays[idx].length, arrays.length);
  const totalLength = sum(lengths);
  return virtual.array(
    (idx) => {
      for (let i = 0;i < lengths.length;i++) {
        if (idx < lengths[i]) {
          return arrays[i][idx];
        } else {
          idx -= lengths[i];
        }
      }

      throw new Error(`Did not find the propery array for index: ${sum(lengths) + idx}`);
    },
    totalLength,
  );
}

export function chunk<T, N extends number>(input: Array<T>, chunkSize: N): Array<Array<T>> {
  const result: Array<Array<T>> = [];
  for (let i = 0;i < input.length;i += chunkSize) {
    result.push(input.slice(i, i + chunkSize));
  }
  return result;
}


type CountResult<T=unknown> = {
  byItem: Map<T, number>;
  byCount: Map<number, Set<T>>;
  max: {
    count: number;
    items: Set<T>;
  },
  min: {
    count: number;
    items: Set<T>;
  },
};

export function count<A>(input: A[]): CountResult<A> {
  const EMPTY_SET = new Set<A>();
  const seen = new Map<A, number>();
  const counts: Map<number, Set<A>> = new Map([[0, new Set()]]);
  let max = 0;
  let min = 0;
  for(let i = 0;i < input.length;i++) {
    const item = input[i];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentCount = seen.has(item) ? seen.get(item)! : 0;
    const currentCounts = counts.get(currentCount) || EMPTY_SET;
    if (currentCounts) {
      currentCounts.delete(item);
    }

    const newCount = currentCount + 1;
    if (!counts.has(newCount)) {
      counts.set(newCount, new Set());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const newCounts = counts.get(newCount)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    newCounts.add(item);

    if (currentCounts.size === 0) {
      if (currentCount === min) {
        min = newCount;
      }
      // No need to keep it around
      counts.delete(currentCount);
    }
    if (newCounts.size === 1) {
      if (newCount > max) {
        max = newCount;
      }
      if (newCount < min) {
        min = newCount;
      }
    }

    seen.set(item, newCount);
  }
  return {
    byItem: seen,
    byCount: counts,
    max: {
      count: max,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      items: counts.get(max)!,
    },
    min: {
      count: min,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      items: counts.get(min)!,
    },
  };
}

export function fill<T>(element: T, length: number) {
  return virtual.array(() => element, length);
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

export function max<T>(input: Array<T>): T {
  if (input.length === 0) {
    throw new Error("Can not find the maximum of zero values.");
  }
  let greatest = input[0];
  view(input, 1)
    .forEach((item) => {
      if (item > greatest) {
        greatest = item;
      }
    });
  return greatest;
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

range.inclusive = function rangeInclusive(start: number, end: number, options?: Exclude<RangeOptions, 'inclusive'>) {
  return range(start, end, {
    inclusive: true,
    ...options,
  });
};


export function realize<T>(virtual: Array<T>): Array<T>;
export function realize<T>(generator: (idx: number) => T, length: number): Array<T>;
export function realize<T>(input: Array<T> | ((idx: number) => T), length?: number): Array<T> {
  if (Array.isArray(input)) {
    return Array.from(input);
  }
  return Array.from(virtual.array(input, length || 0));
}

export function reduce<T, R>(input: Array<T>, callback: (currentReducedValue: R, nextValueToReduce: T, valueIndex: number) => R, initialValue: R): R {
  let result: R = initialValue;
  for (let i = 0;i < input.length;i++) {
    result = callback(result, input[i], i);
  }
  return result;
}

export function reverse<T>(input: Array<T>): Array<T> {
  return virtual.array((idx) => input[input.length - idx - 1], input.length);
}

export function sorted<T>(input: Array<T>, compare: comparator.Comparator<T> = comparator.generic<T>): Array<T> {
  return input.sort(compare);
}

sorted.slice = function sortedSlice<T>(input: Array<T>, comparator: comparator.Comparator<T>): Array<T> {
  return sorted(input.slice(0), comparator);
};

export function stepper<T>(input: Array<T>): () => T | void {
  let idx = 0;
  return () => input[idx++];
}

export function sum(input: Array<number>): number {
  let result = 0;
  for (let i = 0;i < input.length;i++) {
    result += input[i];
  }
  return result;
}

export function view<T>(input: Array<T>, start: number, end?: number) {
  const length = end === undefined ? input.length - start : end - start;
  return virtual.array<T>((idx) => input[idx + start], length);
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

export function zip<T>(...arrays: Array<Array<T>>): Array<Array<T>> {
  view(arrays, 1)
    .forEach((additionalArray) => {
      if (additionalArray.length !== arrays[0].length) {
        throw new Error(`Can not zip arrays with different length: ${additionalArray.length} !== ${arrays[0].length}`);
      }
    });
  return virtual.array((colIdx) => virtual.array((rowIdx) => arrays[rowIdx][colIdx], arrays.length), arrays[0].length);
}
