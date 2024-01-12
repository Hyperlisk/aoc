

import { array, comparator, ds, fn, graph, grid, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 17);
const GRID = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, String)
);
const ROWS = GRID.length;
const COLS = GRID[0].length;

const { LEFT, RIGHT, UP, DOWN } = grid.DIRECTIONS;

type DIR = grid.DIR;
type RC = grid.RC;


function solve() {
  // eslint-disable-next-line prefer-const
  let result = 0;

  const BOUNDS_CHECK = (at: grid.GridPoint) => {
    if (at.row < 0 || at.row === GRID.length || at.col < 0 || at.col === GRID[0].length) {
      return undefined;
    }

    return at;
  };

  const N = GRID.map((row) => row.map((col) => Number(col)));
  const GOAL: RC = [ROWS - 1, COLS - 1];

  type Item = [row: number, col: number, facing: DIR, dirStepsTaken: number, cost: number, seen: ds.SetND<RC>];
  let lowestCost = Infinity;
  // log.write(lowestCost);
  const remaining: ds.Queue<Item> = ds.queue.priority(([aRow, aCol, , , aCost], [bRow, bCol, , , bCost]) => {
    return comparator.numbers(aRow + aCol + aCost, bRow + bCol + bCost);
  });
  remaining.push([0, 0, RIGHT, 0, 0, ds.setND()]);
  const allSeenLow = ds.mapND<[row: number, col: number, facing: DIR, dirStepsTaken: number], number>();
  while (remaining.length > 0) {
    const [row, col, facing, dirStepsTaken, cost, seen] = remaining.pop();

    if (cost >= lowestCost) {
      // log.write(row, col, facing, dirStepsTaken, cost, log.stringify(seen));
      // log.write(' \\ too costly');
      continue;
    }

    if (comparator.generic([row, col], GOAL) === 0) {
      // log.write(row, col, facing, dirStepsTaken, cost, log.stringify(seen));
      lowestCost = cost;
      // log.write(' ! New low cost:', lowestCost);
      // log.write(' ! Remaining:', remaining.length);
      continue;
    }

    const seenCostFromHere = allSeenLow.get([row, col, facing, dirStepsTaken]);
    if (seenCostFromHere !== undefined && seenCostFromHere <= cost) {
      // log.write(row, col, facing, dirStepsTaken, cost, log.stringify(seen));
      // log.write(' \\ seen at lower cost');
      continue;
    }
    allSeenLow.set([row, col, facing, dirStepsTaken], cost);

    const current = grid.at(row, col);

    const left = BOUNDS_CHECK(grid.navigator.head.left(current, facing));
    const leftFacing = (() => {
      if (facing === LEFT) {
        return DOWN;
      } else if (facing === RIGHT) {
        return UP;
      } else if (facing === UP) {
        return LEFT;
      } else {
        return RIGHT;
      }
    })();
    if (left && !seen.has([left.row, left.col])) {
      const seenClone = seen.clone();
      seenClone.add([left.row, left.col]);
      remaining.push([left.row, left.col, leftFacing, 1, cost + N[left.row][left.col], seenClone]);
    }

    const right = BOUNDS_CHECK(grid.navigator.head.right(current, facing));
    const rightFacing = (() => {
      if (facing === LEFT) {
        return UP;
      } else if (facing === RIGHT) {
        return DOWN;
      } else if (facing === UP) {
        return RIGHT;
      } else {
        return LEFT;
      }
    })();
    if (right && !seen.has([right.row, right.col])) {
      const seenClone = seen.clone();
      seenClone.add([right.row, right.col]);
      remaining.push([right.row, right.col, rightFacing, 1, cost + N[right.row][right.col], seenClone]);
    }

    const forward = BOUNDS_CHECK(grid.navigator.head.forward(current, facing));
    if (forward && dirStepsTaken < 3 && !seen.has([forward.row, forward.col])) {
      const seenClone = seen.clone();
      seenClone.add([forward.row, forward.col]);
      remaining.push([forward.row, forward.col, facing, dirStepsTaken + 1, cost + N[forward.row][forward.col], seenClone]);
    }
  }
  result = lowestCost;

  return result;
}

log.write(solve());
