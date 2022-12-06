
import * as log from "./log";

type VirtualArrayIteratorResult<T> = {
  done: boolean,
  value?: T,
};

type VirtualArrayIterator<T> =
  () => {
    [Symbol.iterator](): VirtualArrayIterator<T>;
    next(): VirtualArrayIteratorResult<T>;
  };

function virtualArrayIterator<T>(generator, length): VirtualArrayIterator<T> {
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
          value: generator(valuesEmitted++),
          done: false,
        };
      },
    };
  };
  return iterator;
}

const loggedStacks: Set<string> = new Set();

export function array<T>(generator: (index: number) => T, length: number) {
  const proxyHandler = ((shim: null | Array<T>, loggedMethods: Set<string> = new Set()) => ({
    get(target, property, receiver) {
      if (property === "length") {
        return length;
      }
      if (typeof property === "string" && property.match(/^(0|[1-9][0-9]*)$/)) {
        const propertyAsNumber = parseInt(property, 10);
        return generator(propertyAsNumber);
      }
      const valuesIterator = virtualArrayIterator(generator, length);
      if (property === Symbol.iterator) {
        return valuesIterator;
      }
      if (typeof target[property] !== "function") {
        throw new Error(`Not sure how to handle this property yet: ${property}`);
      }
      if (shim === null) {
        try {
          throw new Error(`Using array shim for "Virtual.${property}". This will probably impact performace.`);
        } catch (e) {
          if (!loggedStacks.has(e.stack)) {
            log.error(e);
            loggedStacks.add(e.stack);
          }
        }
        shim = [];
        for (let idx = 0; idx < length; idx++) {
          shim.push(generator(idx));
        }
      }
      return target[property].bind(shim);
    },
  }))(null);
  return new Proxy([], proxyHandler);
};
