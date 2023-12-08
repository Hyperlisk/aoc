
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

export function strings(a: string, b: string): ComparatorResult {
  const cmp = a.localeCompare(b);
  return cmp > 0 ? 1 : cmp < 0 ? -1 : 0;
}

strings.descending = reversed(strings);

export function generic(a: unknown, b: unknown): ComparatorResult {
  const typeofA = typeof a;
  const typeofB = typeof b;
  if (typeofA === 'bigint' && typeofB === 'bigint') {
    return bigints(a as bigint, b as bigint);
  }
  if (typeofA === 'number' && typeofB === 'number') {
    return numbers(a as number, b as number);
  }
  if (typeofA === 'string' && typeofB === 'string') {
    return strings(a as string, b as string);
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      throw new Error('Can not compare different length arrays.');
    }
    for (let i = 0;i < a.length;i++) {
      const result = generic(a[i], b[i]);
      if (result) {
        return result;
      }
    }
    return 0;
  }
  throw new Error(`Types do not align or are not handled (object, etc).\n\na: ${JSON.stringify(a, null, 2)}\n\nb: ${JSON.stringify(b, null, 2)}`);
}
