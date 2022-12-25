
import * as comparator from "./comparator.js";

export type AbstractPointPart<XT extends string, YT extends string> = { [key in XT | YT]: number };
export type AbstractPointDims<XT extends string, YT extends string> = { dims: { x: XT, y: YT } };
export type AbstractPoint<XT extends string, YT extends string> = AbstractPointPart<XT, YT> & AbstractPointDims<XT, YT>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPoint = AbstractPoint<any, any>;
export type Point = AbstractPoint<'x', 'y'>;

export function at(x: number, y: number): Point {
  return of(x, y, 'x', 'y');
}

type PointComparatorResult = {
  x: comparator.ComparatorResult,
  y: comparator.ComparatorResult,
};

export function compare(a: AnyPoint, b: AnyPoint): PointComparatorResult {
  return {
    x: comparator.numbers(x(a), x(b)),
    y: comparator.numbers(y(a), y(b)),
  };
}

export function from(source: AnyPoint): Point {
  return at(x(source), y(source));
}

export function of<XT extends string, YT extends string>(x: number, y: number, xProperty: XT, yProperty: YT): AbstractPoint<XT, YT> {
  return Object.assign(
    {
      [xProperty]: x,
      [yProperty]: y,
    } as AbstractPointPart<XT, YT>,
    {
      dims: {
        x: xProperty,
        y: yProperty,
      },
    },
  );
}

export class set<T extends AnyPoint> extends Set<T> {
  size: number;
  xToSeenY: Map<number, Set<number>>;

  constructor() {
    super();

    this.size = 0;
    this.xToSeenY = new Map();
  }

  add(value: T): this {
    const seenY = this.xToSeenY.get(x(value));
    if (seenY) {
      const sizeBeforeAdd = seenY.size;
      seenY.add(y(value));
      this.size += seenY.size - sizeBeforeAdd;
    } else {
      const newSeenY: Set<number> = new Set([y(value)]);
      this.size += 1;
      this.xToSeenY.set(x(value), newSeenY);
    }
    return this;
  }

  clear() {
    this.size = 0;
    this.xToSeenY.clear();
  }

  delete(value: T): boolean {
    const seenY = this.xToSeenY.get(x(value));
    if (seenY) {
      const sizeBeforeAdd = seenY.size;
      const result = seenY.delete(y(value));
      this.size += seenY.size - sizeBeforeAdd;
      return result;
    }
    return false;
  }

  has(value: T): boolean {
    const seenY = this.xToSeenY.get(x(value));
    if (seenY) {
      return seenY.has(y(value));
    }
    return false;
  }
}

export function x(point: AnyPoint): number {
  return point[point.dims.x];
}

export function y(point: AnyPoint): number {
  return point[point.dims.y];
}
