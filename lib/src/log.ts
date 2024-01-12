
export function error(...args: Parameters<typeof console.error>) {
  console.error(...args);
}

type StringifyOptions = {
  excludeKeys?: string[];
  indent?: string | number;
  replacer?: (key: string, value: unknown) => unknown;
};

export function stringify(obj: unknown, options: StringifyOptions = {}) {
  const excludeKeys = new Set(options.excludeKeys);
  const indent = options.indent;
  const replacer = options.replacer || ((key: string, value: unknown) => value);

  return JSON.stringify(obj, (key, item) => {
    if (excludeKeys.has(key)) {
      return undefined;
    }
    const replaced = replacer(key, item);
    if (Array.isArray(replaced)) {
      return replaced;
    }
    if (replaced instanceof Set) {
      return ['S', Array.from(replaced)];
    }
    if (replaced === Infinity) {
      return 'Infinity';
    }
    if (replaced === -Infinity) {
      return '-Infinity';
    }
    if (replaced && typeof replaced === 'object') {
      if ('entries' in replaced && typeof replaced.entries === 'function') {
        const size = 'size' in replaced ? replaced.size : '?';
        const map: Record<string, unknown> = {};
        for (const [key, value] of replaced.entries()) {
          map[key] = value;
        }
        return ['.entries()', size, map];
      }
      if ('values' in replaced && typeof replaced.values === 'function') {
        const size = 'size' in replaced ? replaced.size : '?';
        return ['.values()', size, (replaced.values())];
      }
    }
    return replaced;
  }, indent);
}

export function write(...args: Parameters<typeof console.log>) {
  console.log(...args);
}
