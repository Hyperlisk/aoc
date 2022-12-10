
import * as log from "./log.js";

type VirtualArrayIteratorResult<T> = {
  done: boolean,
  value?: T,
};

type VirtualArrayIterator<T> =
  () => {
    [Symbol.iterator](): VirtualArrayIterator<T>;
    next(): VirtualArrayIteratorResult<T>;
  };

function virtualArrayIterator<T>(receiver: Array<T> , length: number): VirtualArrayIterator<T> {
  let valuesEmitted = 0;

  function iterator() {
    return {
      [Symbol.iterator](): VirtualArrayIterator<T> {
        return iterator;
      },
      next(): VirtualArrayIteratorResult<T> {
        if (valuesEmitted === length) {
          return {
            value: undefined,
            done: true,
          };
        }
        return {
          value: receiver[valuesEmitted++],
          done: false,
        };
      },
    };
  }

  return iterator;
}

const loggedStacks: Set<string> = new Set();

export function array<T>(generator: (index: number) => T | undefined, length: number, options?: { cache?: Map<string, T | undefined> | boolean }): Array<T> {
  const actualOptions = {
    cache: true,
    ...options,
  };
  const cache = actualOptions.cache === false
    ? null
    : actualOptions.cache === true
      ? new Map<string, T | undefined>()
      : actualOptions.cache;
  const proxyHandler = {
    get(target: Array<T>, property: string | symbol, receiver: Array<T>) {
      if (typeof property === 'symbol') {
        if (property === Symbol.iterator) {
          return virtualArrayIterator(receiver, length);
        }
        throw new Error(`Not sure how to handle this symbol yet: ${String(property)}`);
      }
      if (property === "length") {
        return length;
      }
      if (property.match(/^(0|[1-9][0-9]*)$/)) {
        const propertyAsNumber = parseInt(property, 10);
        if (cache !== null){
          if (!cache.has(property)) {
            cache.set(property, generator(propertyAsNumber));
          }
          return cache.get(property);
        }
        return generator(propertyAsNumber);
      }

      if (property === "map") {
        return <R>(itemGenerator: (item: T, idx: number) => R) => array<R>((idx) => itemGenerator(receiver[idx], idx), length);
      }
      if (property === "forEach") {
        let i = 0;
        return (itemHandler: Parameters<typeof Array.prototype.forEach>[0]) => {
          for (;i < length;i++) {
            itemHandler(receiver[i], i, receiver);
          }
        };
      }

      const arrayProperty = target[property as keyof Array<T>];
      if (typeof arrayProperty !== "function") {
        throw new Error(`Not sure how to handle this property yet: ${property}`);
      }

      try {
        throw new Error(`Using array shim for "Virtual.${property}". This will probably impact performace.`);
      } catch (e: unknown) {
        if (e instanceof Error) {
          if (e.stack !== undefined && !loggedStacks.has(e.stack)) {
            log.error(e);
            loggedStacks.add(e.stack);
          }
        }
      }
      return arrayProperty.bind(Array.from(receiver));
    },
    set(target: Array<T>, property: string | symbol, value: T) {
      if (typeof property === "string" && cache !== null) {
        cache.set(property, value);
        return true;
      }
      return false;
    },
  };
  return new Proxy([], proxyHandler);
}
