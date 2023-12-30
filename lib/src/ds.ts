
import * as array from "./array.js";
import * as comparator from "./comparator.js";


type EnumResultKeys<T extends string> = {
  [key in T]: number;
};
type EnumResult<T extends string> = EnumResultKeys<T> & {
  name(value: number): string;
  value(name: string): number;
}

export function Enum<const T extends string>(...names: (T | [T, number])[]): EnumResult<T> {
  let value = 1;
  const _nameToValue: EnumResultKeys<T> = Object.create(null) as EnumResultKeys<T>;
  const _valueToName: Record<number, string> = {};
  names.forEach((name) => {
    if (typeof name !== 'string') {
      const [nameT, newValue] = name;
      value = newValue;
      _nameToValue[nameT] = value;
      _valueToName[value] = nameT;
    } else {
      _nameToValue[name] = value;
      _valueToName[value] = name;
      value += 1;
    }
  });
  const mixin = {
    name(value: number) {
      return _valueToName[value];
    },
    value(name: string) {
      return (_nameToValue as Record<string, number>)[name];
    },
  };
  return Object.assign(mixin, _nameToValue);
}

type Split<S extends string> =
    string extends S ? string[] :
    S extends '' ? [] :
    S extends `${infer T}${infer U}` ? [T, ...Split<U>] : [S];

type SplitValues<S extends string> =
    string extends S ? string :
    S extends '' ? never :
    S extends `${infer T}${infer U}` ? T | SplitValues<U> : S;

Enum.fromString = function EnumFromString<const T extends string>(input: T): EnumResult<SplitValues<T>> {
  const names: Split<T> = input.split('') as Split<T>;
  return Enum(...names);
};


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

export function mapND<KK extends Array<unknown>, V>(compareKeys: comparator.Comparator<KK> = comparator.generic): MapND<KK, V> {
  return _mapND(compareKeys);
}


export type SetND<V> = {
  add: (value: V) => boolean;
  clone: () => SetND<V>;
  delete: (value: V) => boolean;
  has: (value: V) => boolean;
  matching: (value: V) => V | null;
  size: number;
  values: () => V[];
}

export function setND<V extends unknown[]>(compare: comparator.Comparator<V> = comparator.generic): SetND<V> {
  const savedValues: V[] = [];
  const getSavedValuesIndex = (value: V): number | null => {
    if (savedValues.length === 0) {
      // Nothing is saved.
      return null;
    }
    if (compare(value, savedValues[0]) === -1) {
      // The key we are looking for would be to the left of the first value, so it is not saved.
      return null;
    }
    if (compare(value, savedValues[savedValues.length - 1]) === 1) {
      // The key we are looking for would be to the right of the last value, so it is not saved.
      return null;
    }
    const savedIndex = array.binary(savedValues, value, compare);
    return compare(value, savedValues[savedIndex]) === 0 ? savedIndex : null;
  };
  return {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    __aoc_type: 'setND',
    add(value: V) {
      const savedIndex = getSavedValuesIndex(value);
      if (savedIndex === null) {
        const insertIndex = array.binary(savedValues, value, compare);
        savedValues.splice(insertIndex, 0, value);
      } else {
        savedValues[savedIndex] = value;
      }
      return savedIndex === null;
    },
    clone(): SetND<V> {
      const result = setND<V>(compare);
      savedValues.forEach((value) => {
        result.add(value);
      });
      return result;
    },
    delete(value: V): boolean {
      const savedIndex = getSavedValuesIndex(value);
      if (savedIndex === null) {
        return false;
      }

      savedValues.splice(savedIndex, 1);
      return true;
    },
    matching(value: V): V | null {
      const savedIndex = getSavedValuesIndex(value);
      if (savedIndex) {
        return savedValues[savedIndex];
      }
      return null;
    },
    has(value: V): boolean {
      const savedIndex = getSavedValuesIndex(value);
      return savedIndex !== null;
    },
    get size() {
      return savedValues.length;
    },
    values(): V[] {
      return savedValues.slice(0);
    },
  };
}


export type Queue<T> = {
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

function queuePriority<T>(compare: comparator.Comparator<T> = comparator.generic<T>): Queue<T> {
  const items: Array<T> = [];

  function push(item: T) {
    return array.binary.insert<T>(items, item, compare);
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
