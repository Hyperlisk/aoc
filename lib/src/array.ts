export function sum(input: Array<number>): number {
  return input.reduce((total, n) => total + n, 0);
}
