
import * as array from "./array.js";
import * as comparator from "./comparator.js";

export type Map2D<K1, K2, V> = {
  delete: (key1: K1, key2: K2) => boolean;
  get: (key1: K1, key2: K2) => V | undefined;
  has: (key1: K1, key2: K2) => boolean;
  set: (key1: K1, key2: K2, value: V) => Map2D<K1, K2, V>;
}

export function map2D<K1, K2, V>(): Map2D<K1, K2, V> {
  const map = new Map<K1, Map<K2, V>>();
  return {
    delete(key1: K1, key2: K2): boolean {
      const map2 = map.get(key1);
      if (map2) {
        return map2.delete(key2);
      }
      return false;
    },
    get(key1: K1, key2: K2): V | undefined {
      const map2 = map.get(key1);
      if (map2) {
        return map2.get(key2);
      }
      return undefined;
    },
    has(key1: K1, key2: K2): boolean {
      const map2 = map.get(key1);
      if (map2) {
        return map2.has(key2);
      }
      return false;
    },
    set(key1: K1, key2: K2, value: V) {
      if (!map.has(key1)) {
        map.set(key1, new Map());
      }
      const map2 = map.get(key1);
      if (map2) {
        map2.set(key2, value);
      }
      return this;
    },
  };
}

type Queue<T> = {
  length: number;
  pop(): T;
  push(item: T): number;
};

export function queue<T>(): Queue<T> {
  const items: Array<T> = [];

  function push(item: T) {
    const nextIndex = items.length;
    items.push(item);
    return nextIndex;
  }

  function pop() {
    if (items.length === 0) {
      throw new Error("Nothing to pop!");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return items.shift()!;
  }

  return {
    get length() {
      return items.length;
    },
    pop: pop,
    push: push,
  };
}

function queuePriority<T>(comparator: comparator.Comparator<T>): Queue<T> {
  const items: Array<T> = [];

  function push(item: T) {
    return array.binary.insert<T>(items, item, comparator);
  }

  function pop() {
    if (items.length === 0) {
      throw new Error("Nothing to pop!");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return items.shift()!;
  }

  return {
    get length() {
      return items.length;
    },
    pop: pop,
    push: push,
  };
}

type ObjectWithPriority<T> = {
  priorirty: number;
  value: T;
};

function simplePriorityComparator<T>(a: ObjectWithPriority<T>, b: ObjectWithPriority<T>): comparator.ComparatorResult {
  return comparator.numbers(a.priorirty, b.priorirty);
}

queuePriority.simple = function queuePrioritySimple<T>(): Queue<ObjectWithPriority<T>> {
  return queue.priority(simplePriorityComparator);
};

queue.priority = queuePriority;
