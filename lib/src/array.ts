export function intersection<T>(a: Array<T>, b: Array<T>): Array<T> {
  const seen: Set<T> = new Set(a);
  const results: Set<T> = new Set();
  b.forEach(item => {
    if (seen.has(item)) {
      results.add(item);
    }
  });
  return Array.from(results);
};

export function sum(input: Array<number>): number {
  return input.reduce((total, n) => total + n, 0);
};
