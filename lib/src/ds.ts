
import * as array from "./array.js";
import * as comparator from "./comparator.js";


type EnumResult = {
  [name: string]: number;
} & {
  name(value: number): string;
  value(name: string): number;
}

export function Enum(names: string | (string | [string, number])[]): EnumResult {
  const generated = typeof names === 'string';
  if (typeof names === 'string') {
    const newNames: string[] = [];
    for (let i = 0;i < names.length;i++) {
      newNames.push(`_${names.charAt(i).toUpperCase()}`);
    }
    names = newNames;
  }

  let value = 1;
  const _nameToValue: { [name: string]: number; } = {};
  const _valueToName: Record<number, string> = {};
  names.forEach((name) => {
    if (typeof name !== 'string') {
      [name, value] = name;
    }
    name = name.toUpperCase();
    _nameToValue[name] = value;
    _valueToName[value] = name;
    value += 1;
  });
  const mixin = {
    name(value: number) {
      if (generated) {
        return _valueToName[value].substring(1);
      } else {
        return _valueToName[value];
      }
    },
    value(name: string) {
      if (generated) {
        return _nameToValue[`_${name}`];
      } else {
        return _nameToValue[name];
      }
    },
  };
  return Object.assign(mixin, _nameToValue);
}


export type MapND<KK extends unknown[], V> = {
  delete: (keys: KK) => boolean;
  get: (keys: KK) => V | undefined;
  has: (keys: KK) => boolean;
  set: (keys: KK, value: V) => MapND<KK, V>;
}

function _mapND<KK extends Array<unknown>, V>(compareKeys: comparator.Comparator<KK>): MapND<KK, V> {
  const savedKeys: Array<KK> = [];
  const savedValues: Array<V> = [];
  const getSavedKeysIndex = (keys: KK): number | null => {
    if (savedKeys.length === 0) {
      // Nothing is saved.
      return null;
    }
    if (compareKeys(keys, savedKeys[0]) === -1) {
      // The key we are looking for would be to the left of the first value, so it is not saved.
      return null;
    }
    if (compareKeys(keys, savedKeys[savedKeys.length - 1]) === 1) {
      // The key we are looking for would be to the right of the last value, so it is not saved.
      return null;
    }
    const savedIndex = array.binary(savedKeys, keys, compareKeys);
    return compareKeys(keys, savedKeys[savedIndex]) === 0 ? savedIndex : null;
  };
  return {
    delete(keys: KK): boolean {
      const savedIndex = getSavedKeysIndex(keys);
      if (savedIndex === null) {
        return false;
      }

      savedKeys.splice(savedIndex, 1);
      savedValues.splice(savedIndex, 1);
      return true;
    },
    get(keys: KK): V | undefined {
      const savedIndex = getSavedKeysIndex(keys);
      if (savedIndex === null) {
        return undefined;
      }
      return savedValues[savedIndex];
    },
    has(keys: KK): boolean {
      const savedIndex = getSavedKeysIndex(keys);
      return savedIndex !== null;
    },
    set(keys: KK, value: V) {
      const savedIndex = getSavedKeysIndex(keys);
      if (savedIndex !== null) {
        savedValues[savedIndex] = value;
      } else {
        const insertIndex = array.binary(savedKeys, keys, compareKeys);
        savedKeys.splice(insertIndex, 0, keys);
        savedValues.splice(insertIndex, 0, value);
      }
      return this;
    },
  };
}

_mapND.genericCompareKeys = function mapNDGenericCompareKeys<KK extends unknown[]>(keysA: KK, keysB: KK): comparator.ComparatorResult {
  let result: comparator.ComparatorResult | null = null;
  for (let i = 0;i < keysA.length;i++) {
    const a = keysA[i];
    const b = keysB[i];
    const typeofA = typeof a;
    const typeofB = typeof b;
    if (typeofA === 'bigint' && typeofB === 'bigint') {
      result = comparator.bigints(a as bigint, b as bigint);
      if (result) {
        return result;
      }
    }
    if (typeofA === 'number' && typeofB === 'number') {
      result = comparator.numbers(a as number, b as number);
      if (result) {
        return result;
      }
    }
    if (typeofA === 'string' && typeofB === 'string') {
      result = comparator.strings(a as string, b as string);
      if (result) {
        return result;
      }
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      result = _mapND.genericCompareKeys(a, b);
      if (result) {
        return result;
      }
    }
  }
  if (result === null) {
    throw new Error(`Mapped key types do not align or are not handled (object, etc).\n\nkeysA: ${JSON.stringify(keysA, null, 2)}\n\nkeysB: ${JSON.stringify(keysB, null, 2)}`);
  }
  return result;
};

export function mapND<KK extends Array<unknown>, V>(compareKeys: comparator.Comparator<KK> = _mapND.genericCompareKeys): MapND<KK, V> {
  return _mapND(compareKeys);
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
