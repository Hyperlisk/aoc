

import { grid, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 14);
const GRID = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, String)
);
const ROWS = GRID.length;


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

      const up = BOUNDS_CHECK(grid.navigator.step.up(current));
      if (up && GRID[up.row][up.col] === '.') {
        GRID[current.row][current.col] = '.';
        GRID[up.row][up.col] = 'O';
        return grid.navigator.step.up(current);
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

  rockRoller.forEach((roll) => {
    const path = roll.while(true);
    result += ROWS - (path[path.length - 2]?.row || 0);
  });

  return result;
}

log.write(solve());
