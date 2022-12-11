
type Point = {
  x: number;
  y: number;
};

type FromPoint<T, XT extends keyof T, YT extends keyof T> = {
  [key in XT | YT]: number;
};

export function from<T, XT extends keyof T, YT extends keyof T>(source: FromPoint<T, XT, YT>, xProperty: XT, yProperty: YT): Point {
  return {
    x: source[xProperty],
    y: source[yProperty],
  };
}

export class set extends Set<Point> {
  size: number;
  xToSeenY: Map<number, Set<number>>;

  constructor() {
    super();

    this.size = 0;
    this.xToSeenY = new Map();
  }

  add(value: Point): this {
    const seenY = this.xToSeenY.get(value.x);
    if (seenY) {
      const sizeBeforeAdd = seenY.size;
      seenY.add(value.y);
      this.size += seenY.size - sizeBeforeAdd;
    } else {
      const newSeenY: Set<number> = new Set([value.y]);
      this.size += 1;
      this.xToSeenY.set(value.x, newSeenY);
    }
    return this;
  }

  clear() {
    this.size = 0;
    this.xToSeenY.clear();
  }

  delete(value: Point): boolean {
    const seenY = this.xToSeenY.get(value.x);
    if (seenY) {
      const sizeBeforeAdd = seenY.size;
      const result = seenY.delete(value.y);
      this.size += seenY.size - sizeBeforeAdd;
      return result;
    }
    return false;
  }

  has(value: Point): boolean {
    const seenY = this.xToSeenY.get(value.x);
    if (seenY) {
      return seenY.has(value.y);
    }
    return false;
  }
}
