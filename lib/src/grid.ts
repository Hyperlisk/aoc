
import * as ds from "./ds.js";
import * as graph from "./graph.js";
import * as point from "./point.js";

export type GridPoint = point.AbstractPoint<'col', 'row'>;

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

type NeighborOffset = {
  colOffset: -1 | 0 | 1;
  rowOffset: -1 | 0 | 1;
};

type NeighborKind = 'all' | 'adjacent' | 'diagonal';

export function neighbors(which: NeighborKind, from: GridPoint, size?: { cols: number, rows: number }): Array<GridPoint> {
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
    .map(({ colOffset, rowOffset }) => at(from.row + rowOffset, from.col + colOffset))
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

neighbors.adjacent = function neighborsAdjacent(point: GridPoint, size?: { cols: number, rows: number }): Array<GridPoint> {
  return neighbors('adjacent', point, size);
};

neighbors.all = function neighborsAll(point: GridPoint, size?: { cols: number, rows: number }): Array<GridPoint> {
  return neighbors('all', point, size);
};

neighbors.diagonal = function neighborsDiagonal(point: GridPoint, size?: { cols: number, rows: number }): Array<GridPoint> {
  return neighbors('diagonal', point, size);
};
