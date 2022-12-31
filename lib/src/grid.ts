
import * as comparator from "./comparator.js";
import * as ds from "./ds.js";
import * as graph from "./graph.js";
import * as point from "./point.js";

export type GridPoint = point.AbstractPoint<'col', 'row'>;

export function at(col: number, row: number): GridPoint {
  return point.of(col, row, 'col', 'row');
}

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
        start = at(other.col, start.row);
      }
      if (startCmp.y === -1) {
        start = at(start.col, other.row);
      }
      const endCmp = point.compare(other, end);
      if (endCmp.x === 1) {
        end = at(other.col, end.row);
      }
      if (endCmp.y === 1) {
        end = at(end.col, other.row);
      }
      return startCmp.x === -1 || startCmp.y === -1 || endCmp.x === 1 || endCmp.y === 1;
    },
  };
}

export type GridNode<T> = graph.Node<{
  gridSource: GridPoint;
  gridValue: T,
}>;

export function nodes<T>(grid: T[][], getNeighbors: (point: GridPoint) => GridPoint[]): ds.MapND<[number, number], GridNode<T>> {
  const result = ds.mapND<[number, number], GridNode<T>>(([colA, rowA], [colB, rowB]) => comparator.numbers(colA, colB) || comparator.numbers(rowA, rowB));
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const node = graph.node({
        gridSource: at(col, row),
        gridValue: grid[row][col],
      });
      result.set([row, col], node);
    }
  }
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const neighbors = getNeighbors(at(col, row));
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

  takeStep.while = function takeStepWhile(condition: true | ((next: GridPoint, path: Array<GridNavigatorResult>) => boolean), callback?: (current: GridPoint, path: Array<GridNavigatorResult>) => true | undefined): void {
    do {
      takeStep();
      const current = path[pathIndex];
      if (current === undefined) {
        return;
      }
      if (condition !== true && !condition(current, path)) {
        return;
      }
      if (callback) {
        const result = callback(current, path);
        if (result !== undefined) {
          return;
        }
      }
    } while (path[pathIndex]);
  };

  return takeStep;
}

navigator.step = {
  down(current: GridPoint): GridPoint {
    return at(current.col, current.row + 1);
  },
  left(current: GridPoint): GridPoint {
    return at(current.col - 1, current.row);
  },
  right(current: GridPoint): GridPoint {
    return at(current.col + 1, current.row);
  },
  up(current: GridPoint): GridPoint {
    return at(current.col, current.row - 1);
  },
};

type NeighborOffset = {
  colOffset: -1 | 0 | 1;
  rowOffset: -1 | 0 | 1;
};

type NeighborKind = 'all' | 'adjacent' | 'diagonal';

export function neighbors(from: GridPoint, size: { cols: number, rows: number }, which: NeighborKind): Array<GridPoint> {
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
    .map(({ colOffset, rowOffset }) => at(from.col + colOffset, from.row + rowOffset))
    .filter(({ col, row }) => {
      if (col < 0 || row < 0) {
        // Out of bounds, negative index.
        return false;
      }
      if (col >= size.cols || row >= size.rows) {
        // Out of bounds, too high index.
        return false;
      }
      return true;
    });
}

neighbors.adjacent = function neighborsAdjacent(point: GridPoint, size: { cols: number, rows: number }): Array<GridPoint> {
  return neighbors(point, size, 'adjacent');
};

neighbors.all = function neighborsAll(point: GridPoint, size: { cols: number, rows: number }): Array<GridPoint> {
  return neighbors(point, size, 'all');
};

neighbors.diagonal = function neighborsDiagonal(point: GridPoint, size: { cols: number, rows: number }): Array<GridPoint> {
  return neighbors(point, size, 'diagonal');
};
