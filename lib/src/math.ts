
export function gcd(a: number, b: number) {
  while (b != 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: number, b: number) {
  return (a * b) / gcd(a, b);
}
