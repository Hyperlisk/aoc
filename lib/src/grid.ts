
import * as ds from "./ds.js";
import * as graph from "./graph.js";
import * as point from "./point.js";

export type GridPoint = point.AbstractPoint<'col', 'row'>;

export const DIRECTIONS = ds.Enum('LEFT', 'RIGHT', 'UP', 'DOWN');
export type DIR = typeof DIRECTIONS.LEFT | typeof DIRECTIONS.RIGHT | typeof DIRECTIONS.UP | typeof DIRECTIONS.DOWN;
export type RC = [row: number, col: number];

export function at(row: number, col: number): GridPoint {
  return point.of(col, row, 'col', 'row');
}
at.point = function atPoint(point: point.Point) {
  return at(point.y, point.x);
};

type GridBox = {
  getEnd(): GridPoint;
  getHeight(): number;
  getStart(): GridPoint;
  getWidth(): number;
  has(other: GridPoint): boolean;
  include(other: GridPoint): boolean;
};

export function box(origin: GridPoint = at(0, 0)): GridBox {
  let end = origin;
  let start = origin;
  return {
    getEnd() {
      return end;
    },
    getHeight() {
      return Math.abs(start.row - end.row);
    },
    getStart() {
      return start;
    },
    getWidth() {
      return Math.abs(start.col - end.col);
    },
    has(other: GridPoint) {
      const startCmp = point.compare(other, start);
      const endCmp = point.compare(other, end);
      return startCmp.x !== -1 && startCmp.y !== -1 && endCmp.x !== 1 && endCmp.y !== 1;
    },
    include(other: GridPoint) {
      const startCmp = point.compare(other, start);
      if (startCmp.x === -1) {
        start = at(start.row, other.col);
      }
      if (startCmp.y === -1) {
        start = at(other.row, start.col);
      }
      const endCmp = point.compare(other, end);
      if (endCmp.x === 1) {
        end = at(end.row, other.col);
      }
      if (endCmp.y === 1) {
        end = at(other.row, end.col);
      }
      return startCmp.x === -1 || startCmp.y === -1 || endCmp.x === 1 || endCmp.y === 1;
    },
  };
}

type IdentifiedRegion = {
  bounds: GridBox;
  coords: ds.SetND<[GridPoint['row'], GridPoint['col']]>;
  items: string[];
  joined: string;
}
export function identify<O extends { [key: string]: string | RegExp }>(grid: string[][], types: O): { [K in keyof O]?: IdentifiedRegion[] } {
  const found: [type: string, set: ds.SetND<[row: number, col: number]>][] = [];
  const typeNames = Object.keys(types).filter((key) => Object.hasOwnProperty.call(types, key));
  const typeRxs: Record<string, RegExp> = {};
  typeNames.forEach((typeName) => {
    const rxVal = types[typeName];
    typeRxs[typeName] = typeof rxVal === 'string' ? new RegExp(rxVal) : rxVal;
  });
  grid.forEach((row, rowIdx) => {
    let current: ds.SetND<[GridPoint['row'], GridPoint['col']]> = ds.setND();
    let currentRx = /^$/;
    let currentType = "";
    row.forEach((cell, colIdx) => {
      if (currentType) {
        if (currentRx.test(cell)) {
          current.add([rowIdx, colIdx]);
          return;
        } else {
          found.push([currentType, current]);
          current = ds.setND();
          currentType = "";
        }
      }
      for (const typeName of typeNames) {
        const rx = typeRxs[typeName];
        if (rx.test(cell)) {
          current.add([rowIdx, colIdx]);
          currentRx = rx;
          currentType = typeName;
          return;
        }
      }
    });
    if (currentType) {
      found.push([currentType, current]);
    }
  });

  const result: { [K in keyof O]?: IdentifiedRegion[] } = {};
  for (const [type, set] of found) {
    if (!(type in result)) {
      result[type as keyof O] = [];
    }
    const coords = set.values();
    const [ [firstRowIdx, firstColIdx] ] = coords;
    const bounds = box(at(firstRowIdx, firstColIdx));
    const items: string[] = [];
    coords.forEach(([rowIdx, colIdx]) => {
      bounds.include(at(rowIdx, colIdx));
      items.push(grid[rowIdx][colIdx]);
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    result[type as keyof O]!.push({
      bounds: bounds,
      coords: set,
      items: items,
      joined: items.join(''),
    });
  }
  return result;
}

export type GridNode<T> = graph.Node<{
  gridSource: GridPoint;
  gridValue: T,
}>;

export function nodes<T>(grid: T[][], getNeighbors: (point: GridPoint) => GridPoint[]): ds.MapND<[number, number], GridNode<T>> {
  const result = ds.mapND<[number, number], GridNode<T>>();
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const node = graph.node({
        gridSource: at(row, col),
        gridValue: grid[row][col],
      });
      result.set([row, col], node);
    }
  }
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const neighbors = getNeighbors(at(row, col));
      for (const neighbor of neighbors) {
        const neighborNode = result.get([neighbor.row, neighbor.col]);
        if (neighborNode) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          result.get([row, col])!.edges.push(neighborNode);
        }
      }
    }
  }
  return result;
}

type GridNavigatorResult = GridPoint | undefined;
type GridNavigatorFn = (current: GridPoint, path: Array<GridNavigatorResult>) => GridNavigatorResult;

export function navigator(start: GridPoint, step: GridNavigatorFn) {
  const path: Array<GridNavigatorResult> = [start];
  let pathIndex = -1;

  function takeStep(): GridNavigatorResult {
    if (pathIndex + 1 === path.length) {
      const current = path[pathIndex];
      if (!current) {
        throw new Error("Need a GridPoint to step from.");
      }
      path.push(step(current, path));
    }
    return path[++pathIndex];
  }

  takeStep.current = function takeStepCurrent(): GridNavigatorResult {
    return path[pathIndex];
  };

  takeStep.back = function takeStepBack(): GridNavigatorResult {
    pathIndex -= 1;
    return path.pop();
  };

  takeStep.path = function takeStepPath(): GridNavigatorResult[] {
    return path.slice(0, pathIndex + 1);
  };

  takeStep.while = function takeStepWhile(condition: true | ((next: GridPoint, path: Array<GridNavigatorResult>) => boolean), callback?: (current: GridPoint, path: Array<GridNavigatorResult>) => true | undefined) {
    const taken: GridNavigatorResult[] = [];
    do {
      taken.push(takeStep());
      const current = path[pathIndex];
      if (current === undefined) {
        return taken;
      }
      if (condition !== true && !condition(current, path)) {
        return taken;
      }
      if (callback) {
        const result = callback(current, path);
        if (result !== undefined) {
          return taken;
        }
      }
    } while (path[pathIndex]);
    return taken;
  };

  return takeStep;
}

navigator.step = {
  down(current: GridPoint): GridPoint {
    return at(current.row + 1, current.col);
  },
  left(current: GridPoint): GridPoint {
    return at(current.row, current.col - 1);
  },
  right(current: GridPoint): GridPoint {
    return at(current.row, current.col + 1);
  },
  up(current: GridPoint): GridPoint {
    return at(current.row - 1, current.col);
  },
};

navigator.head = {
  back(current: GridPoint, facing: DIR): GridPoint {
    if (facing === DIRECTIONS.LEFT) {
      return navigator.step.right(current);
    } else if (facing === DIRECTIONS.RIGHT) {
      return navigator.step.left(current);
    } else if (facing === DIRECTIONS.UP) {
      return navigator.step.down(current);
    } else {
      return navigator.step.up(current);
    }
  },
  left(current: GridPoint, facing: DIR): GridPoint {
    if (facing === DIRECTIONS.LEFT) {
      return navigator.step.down(current);
    } else if (facing === DIRECTIONS.RIGHT) {
      return navigator.step.up(current);
    } else if (facing === DIRECTIONS.UP) {
      return navigator.step.left(current);
    } else {
      return navigator.step.right(current);
    }
  },
  right(current: GridPoint, facing: DIR): GridPoint {
    if (facing === DIRECTIONS.LEFT) {
      return navigator.step.up(current);
    } else if (facing === DIRECTIONS.RIGHT) {
      return navigator.step.down(current);
    } else if (facing === DIRECTIONS.UP) {
      return navigator.step.right(current);
    } else {
      return navigator.step.left(current);
    }
  },
  forward(current: GridPoint, facing: DIR): GridPoint {
    if (facing === DIRECTIONS.LEFT) {
      return navigator.step.left(current);
    } else if (facing === DIRECTIONS.RIGHT) {
      return navigator.step.right(current);
    } else if (facing === DIRECTIONS.UP) {
      return navigator.step.up(current);
    } else {
      return navigator.step.down(current);
    }
  },
};

type Offset<T extends number=number> = {
  colOffset: T;
  rowOffset: T;
};

type NeighborOffset = Offset<-1 | 0 | 1>;

type NeighborKind = 'all' | 'adjacent' | 'diagonal';

export function neighbors(which: NeighborKind, from: GridPoint, size?: { cols: number, rows: number }): Array<GridPoint & { offset: NeighborOffset }> {
  const offsets: Array<NeighborOffset> = [];
  if (which !== 'diagonal') {
    // 'all' or 'adjacent'
    offsets.push({
      colOffset: -1,
      rowOffset: 0,
    });
    offsets.push({
      colOffset: 1,
      rowOffset: 0,
    });
    offsets.push({
      colOffset: 0,
      rowOffset: -1,
    });
    offsets.push({
      colOffset: 0,
      rowOffset: 1,
    });
  }
  if (which !== 'adjacent') {
    // 'all' or 'diagonal'
    offsets.push({
      colOffset: -1,
      rowOffset: -1,
    });
    offsets.push({
      colOffset: 1,
      rowOffset: -1,
    });
    offsets.push({
      colOffset: -1,
      rowOffset: 1,
    });
    offsets.push({
      colOffset: 1,
      rowOffset: 1,
    });
  }
  return offsets
    .map(({ colOffset, rowOffset }) =>
      Object.assign(
        at(from.row + rowOffset, from.col + colOffset),
        { offset: { colOffset, rowOffset } },
      )
    )
    .filter(({ col, row }) => {
      if (col < 0 || row < 0) {
        // Out of bounds, negative index.
        return false;
      }
      if (size && (col >= size.cols || row >= size.rows)) {
        // Out of bounds, too high index.
        return false;
      }
      return true;
    });
}

neighbors.adjacent = function neighborsAdjacent(point: GridPoint, size?: { cols: number, rows: number }) {
  return neighbors('adjacent', point, size);
};

neighbors.all = function neighborsAll(point: GridPoint, size?: { cols: number, rows: number }) {
  return neighbors('all', point, size);
};

neighbors.diagonal = function neighborsDiagonal(point: GridPoint, size?: { cols: number, rows: number }) {
  return neighbors('diagonal', point, size);
};

export function offset(a: GridPoint, b: GridPoint): Offset {
  return {
    rowOffset: b.row - a.row,
    colOffset: b.col - a.col,
  };
}

export function taxi(a: GridPoint, b: GridPoint) {
  const { colOffset, rowOffset } = offset(a, b);
  return Math.abs(colOffset) + Math.abs(rowOffset);
}
