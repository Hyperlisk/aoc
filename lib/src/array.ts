
import * as log from "./log.js";

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
  reverse?: boolean,
};

export function range(start: number, end: number, options?: RangeOptions): Array<number> {
  const { inclusive, reverse } = {
    // Default options
    reverse: false,
    // Override with user-specified options.
    ...options,
  };
  const result = [];
  if (reverse) {
    if (inclusive) {
      result.push(end);
    }
    for(let i = end;--i >= 0;) {
      result.push(i);
    }
  } else {
    for(let i = start;i < end;i++) {
      result.push(i);
    }
    if (inclusive) {
      result.push(end);
    }
  }
  return result;
}

range.inclusive = function rangeInclusive(start: number, end: number, options: Exclude<RangeOptions, 'inclusive'>) {
  return range(start, end, {
    inclusive: true,
    ...options,
  });
};

export function sum(input: Array<number>): number {
  return input.reduce((total, n) => total + n, 0);
};

type VirtualRangeIteratorResult = {
  done: boolean,
  value?: number,
};
type VirtualRangeIterator =
  () => {
    [Symbol.iterator](): VirtualRangeIterator;
    next(): VirtualRangeIteratorResult;
  };

function virtualRangeIterator(virtualRange, start, length): VirtualRangeIterator {
  let numbersEmitted = 0;
  function iterator() {
    return {
      [Symbol.iterator](): VirtualRangeIterator {
        return iterator;
      },
      next(): VirtualRangeIteratorResult {
        if (numbersEmitted === length) {
          return {
            value: undefined,
            done: true,
          };
        }
        return {
          value: start + numbersEmitted++,
          done: false,
        };
      },
    };
  };
  return iterator;
}

const loggedStacks: Set<string> = new Set();
export function virtualRange(start: number, end: number, inclusive: boolean = false): Array<number> {
  const length = end - start + (inclusive ? 1 : 0)
  const proxyHandler = ((shim: null | Array<number>, loggedMethods: Set<string> = new Set()) => ({
    get(target, property, receiver) {
      if (property === "length") {
        return length;
      }
      if (typeof property === "string" && property.match(/^(0|[1-9][0-9]*)$/)) {
        const propertyAsNumber = parseInt(property, 10);
        return start + propertyAsNumber;
      }
      const valuesIterator = virtualRangeIterator(receiver, start, length);
      if (property === Symbol.iterator) {
        return valuesIterator;
      }
      if (typeof target[property] !== "function") {
        throw new Error(`Not sure how to handle this property yet: ${property}`);
      }
      if (shim === null) {
        shim = Array.from(receiver);
      }
      try {
        throw new Error(`Using array shim for "VirtualRange.${property}". This will probably impact performace.`);
      } catch (e) {
        if (!loggedStacks.has(e.stack)) {
          log.error(e);
          loggedStacks.add(e.stack);
        }
      }
      return target[property].bind(shim);
    },
  }))(null);
  return new Proxy([], proxyHandler);
}

virtualRange.inclusive = function rangeInclusive(start: number, end: number) {
  return virtualRange(start, end, true);
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
