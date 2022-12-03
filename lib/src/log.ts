
export function error(...args: Parameters<typeof console.log>) {
  console.log(...args);
}

export function write(line: string) {
  console.log(line);
}
