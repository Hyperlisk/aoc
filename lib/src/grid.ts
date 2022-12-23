
import * as ds from "./ds.js";
import * as graph from "./graph.js";

export type GridPoint = {
  col: number,
  row: number,
};

export type GridNode<T> = graph.Node<{
  gridSource: GridPoint;
  gridValue: T,
}> ;

export function nodes<T>(grid: T[][], getNeighbors: (point: GridPoint) => GridPoint[]): ds.Map2D<number, number, GridNode<T>> {
  const result = ds.map2D<number, number, GridNode<T>>();
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      result.set(
        row,
        col,
        {
          value: {
            gridSource: {
              col: col,
              row: row,
            },
            gridValue: grid[row][col],
          },
          edges: [],
        },
      );
    }
  }
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const neighbors = getNeighbors({ col, row });
      for (const neighbor of neighbors) {
        const neighborNode = result.get(neighbor.row, neighbor.col);
        if (neighborNode) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          result.get(row, col)!.edges.push(neighborNode);
        }
      }
    }
  }
  return result;
}

type GridNavigatorResult = GridPoint | undefined;
type GridNavigatorFn = (current: GridPoint) => GridNavigatorResult;

export function navigator(start: GridPoint, step: GridNavigatorFn) {
  let current: GridNavigatorResult;

  function takeStep(): GridNavigatorResult {
    if (current) {
      current = step(current);
    } else {
      current = start;
    }

    return current;
  }

  takeStep.current = function takeStepCurrent() {
    return current;
  };

  takeStep.while = function takeStepWhile(condition: (next: GridPoint) => boolean, callback: (current: GridPoint) => true | undefined): void {
    do {
      takeStep();
      if (current === undefined) {
        return;
      }
      if (!condition(current)) {
        return;
      }
      const result = callback(current);
      if (result !== undefined) {
        return;
      }
    } while (current);
  };

  return takeStep;
}

navigator.step = {
  down(current: GridPoint) {
    return {
      col: current.col,
      row: current.row + 1,
    };
  },
  left(current: GridPoint) {
    return {
      col: current.col - 1,
      row: current.row,
    };
  },
  right(current: GridPoint) {
    return {
      col: current.col + 1,
      row: current.row,
    };
  },
  up(current: GridPoint) {
    return {
      col: current.col,
      row: current.row - 1,
    };
  },
};

type NeighborOffset = {
  colOffset: -1 | 0 | 1;
  rowOffset: -1 | 0 | 1;
};

type NeighborKind = 'all' | 'adjacent' | 'diagonal';

export function neighbors(point: GridPoint, size: { cols: number, rows: number }, which: NeighborKind): Array<GridPoint> {
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
    .map(({ colOffset, rowOffset }) => ({
      col: point.col + colOffset,
      row: point.row + rowOffset,
    }))
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
