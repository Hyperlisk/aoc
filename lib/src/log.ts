
export function error(...args: Parameters<typeof console.error>) {
  console.error(...args);
}

export function write(...args: Parameters<typeof console.log>) {
  console.log(...args);
}
