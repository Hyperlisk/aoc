

import { comparator, ds, grid, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 14);
const GRID = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, String)
);
const ROWS = GRID.length;

const { LEFT, RIGHT, UP, DOWN } = ds.Enum('LEFT', 'RIGHT', 'UP', 'DOWN');
let currentDirection = UP;
const nextDirection = (currentDirection: number) => {
  if (currentDirection === UP) {
    return LEFT;
  } else if (currentDirection === LEFT) {
    return DOWN;
  } else if (currentDirection === DOWN) {
    return RIGHT;
  } else if (currentDirection === RIGHT) {
    return UP;
  }
  throw new Error();
};


function solve() {
  let result = 0;

  const parts = grid.identify(GRID, {
    round: /O/,
    cube: /#/,
  });

  const BOUNDS_CHECK = (at: grid.GridPoint) => {
    if (at.row < 0 || at.row === GRID.length || at.col < 0 || at.col === GRID[0].length) {
      return undefined;
    }

    return at;
  };

  const makeNavigatorAt = function (at: grid.GridPoint) {
    return grid.navigator(at, (current) => {

      if (currentDirection === UP) {
        const up = BOUNDS_CHECK(grid.navigator.step.up(current));
        if (up && GRID[up.row][up.col] === '.') {
          GRID[current.row][current.col] = '.';
          GRID[up.row][up.col] = 'O';
          return up;
        }
      }

      if (currentDirection === DOWN) {
        const down = BOUNDS_CHECK(grid.navigator.step.down(current));
        if (down && GRID[down.row][down.col] === '.') {
          GRID[current.row][current.col] = '.';
          GRID[down.row][down.col] = 'O';
          return down;
        }
      }

      if (currentDirection === LEFT) {
        const left = BOUNDS_CHECK(grid.navigator.step.left(current));
        if (left && GRID[left.row][left.col] === '.') {
          GRID[current.row][current.col] = '.';
          GRID[left.row][left.col] = 'O';
          return left;
        }
      }

      if (currentDirection === RIGHT) {
        const right = BOUNDS_CHECK(grid.navigator.step.right(current));
        if (right && GRID[right.row][right.col] === '.') {
          GRID[current.row][current.col] = '.';
          GRID[right.row][right.col] = 'O';
          return right;
        }
      }

      return undefined;
    });
  };

  const rockRoller: ReturnType<typeof makeNavigatorAt>[] = [];
  parts.round?.forEach((region) => {
    region.coords.values().forEach(([row, col]) => {
      rockRoller.push(makeNavigatorAt(grid.at(row, col)));
    });
  });
  
  const hashGrid = () => GRID.map((row) => row.join('')).join('');
  const seen = ds.setND<[hash: string, cycleId: number]>(([a], [b]) => comparator.strings(a, b));
  let counter = 0;
  const count = () => counter++;

  const rollCycle = () => {
    rockRoller.sort((a, b) => {
      const A = a.current();
      const B = b.current();
      if (!A) {
        if (!B) {
          return 0;
        }
        return 1;
      }
      if (!B) {
        return -1;
      }
      return comparator.numbers(A.row, B.row) || comparator.numbers(A.col, B.col);
    }).forEach((roll) => {
      roll.while(true);
      roll.back();
    });
    currentDirection = nextDirection(currentDirection);
    rockRoller.sort((a, b) => {
      const A = a.current();
      const B = b.current();
      if (!A) {
        if (!B) {
          return 0;
        }
        return 1;
      }
      if (!B) {
        return -1;
      }
      return comparator.numbers(A.col, B.col) || comparator.numbers(A.row, B.row);
    }).forEach((roll) => {
      roll.while(true);
      roll.back();
    });
    currentDirection = nextDirection(currentDirection);
    rockRoller.sort((a, b) => {
      const A = a.current();
      const B = b.current();
      if (!A) {
        if (!B) {
          return 0;
        }
        return 1;
      }
      if (!B) {
        return -1;
      }
      return comparator.numbers.descending(A.row, B.row) || comparator.numbers(A.col, B.col);
    }).forEach((roll) => {
      roll.while(true);
      roll.back();
    });
    currentDirection = nextDirection(currentDirection);
    rockRoller.sort((a, b) => {
      const A = a.current();
      const B = b.current();
      if (!A) {
        if (!B) {
          return 0;
        }
        return 1;
      }
      if (!B) {
        return -1;
      }
      return comparator.numbers.descending(A.col, B.col) || comparator.numbers(A.row, B.row);
    }).forEach((roll) => {
      roll.while(true);
      roll.back();
    });
    currentDirection = nextDirection(currentDirection);
  };

  let findingCycle = true;
  let remainingCycles = 0;
  while (findingCycle) {
    rollCycle();
    const item: [hash: string, cycleId: number] = [hashGrid(), count()];
    if (seen.has(item)) {
      findingCycle = false;
      const [, firstCycleId] = seen.matching(item)!;
      const [, secondCycleId] = item;
      const cycleLength = secondCycleId - firstCycleId;
      remainingCycles = ((1_000_000_000 - secondCycleId) % cycleLength) - 1;
    } else {
      seen.add(item);
    }
  }
  while (remainingCycles) {
    rollCycle();
    remainingCycles -= 1;
  }

  rockRoller.forEach((roll) => {
    const path = roll.path();
    result += ROWS - path[path.length - 1]!.row;
  });

  return result;
}

log.write(solve());
