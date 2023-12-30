
import * as comparator from "./comparator.js";
import * as ds from "./ds.js";

export function memoize<A extends Array<unknown>, R>(fn: (...args: A) => R, argsComparator?: comparator.Comparator<A>): typeof fn {
  const memo = ds.mapND<A, R>(argsComparator);
  return function memoized(...args: A): R {
    const cached = memo.get(args);
    if (cached !== undefined) {
      return cached;
    }
    const result = fn(...args);
    memo.set(args, result);
    return result;
  };
}
