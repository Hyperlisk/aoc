
export function error(...args: Parameters<typeof console.error>) {
  console.error(...args);
}

type StringifyOptions = {
  excludeKeys?: string[];
  indent?: string | number;
  replacer?: (key: string, value: unknown) => unknown;
};

export function stringify(obj: unknown, options: StringifyOptions) {
  const excludeKeys = new Set(options.excludeKeys);
  const indent = options.indent;
  const replacer = options.replacer || ((key: string, value: unknown) => value);

  return JSON.stringify(obj, (key, item) => {
    if (excludeKeys.has(key)) {
      return undefined;
    }
    const replaced = replacer(key, item);
    if (replaced instanceof Map) {
      const map = {};
      for (const [key, value] of replaced.entries()) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        map[key] = value;
      }
      return ['M', replaced.size, map];
    }
    if (replaced instanceof Set) {
      return ['S', Array.from(replaced)];
    }
    return replaced;
  }, indent);
}

export function write(...args: Parameters<typeof console.log>) {
  console.log(...args);
}
