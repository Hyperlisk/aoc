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

export function sum(input: Array<number>): number {
  return input.reduce((total, n) => total + n, 0);
};
