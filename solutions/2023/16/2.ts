

import { ds, grid, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 16);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) =>
    input
      .parse(line, input.parse.split.character, String)
);

const DIR = ds.Enum(['LEFT', 'RIGHT', 'UP', 'DOWN']);


function solve(g: string[][]) {
  let result = 0;

  const starts: [cell: grid.GridPoint, direction: number][] = [];
  for (let i = 0;i < g.length;i++) {
    starts.push([grid.at(0, i), DIR.DOWN]);
    starts.push([grid.at(g.length - 1, i), DIR.UP]);
  }
  for (let i = 0;i < g[0].length;i++) {
    starts.push([grid.at(i, 0), DIR.RIGHT]);
    starts.push([grid.at(i, g[0].length - 1), DIR.LEFT]);
  }
  starts.forEach(([startPoint, startDirection]) => {
    const navigators = [];
    const makeNavigatorAt =
    (at: grid.GridPoint, direction: typeof DIR.LEFT | typeof DIR.RIGHT | typeof DIR.UP | typeof DIR.DOWN, seen: ds.SetND<[row: number, col: number, direction: number]>) =>
      Object.assign(
        grid.navigator(at, (current) => {
          if (current.row < 0 || current.row === g.length || current.col < 0 || current.col === g[0].length || seen.has([current.row, current.col, direction])) {
            return undefined;
          }
          seen.add([current.row, current.col, direction]);

          const c = g[current.row][current.col];
          if (
            c === '.' ||
          (c === '-' && (direction === DIR.LEFT || direction === DIR.RIGHT)) ||
          (c === '|' && (direction === DIR.UP || direction === DIR.DOWN))
          ) {
            if (direction === DIR.LEFT) {
              return grid.navigator.step.left(current);
            }
            if (direction === DIR.RIGHT) {
              return grid.navigator.step.right(current);
            }
            if (direction === DIR.UP) {
              return grid.navigator.step.up(current);
            }
            if (direction === DIR.DOWN) {
              return grid.navigator.step.down(current);
            }
          }
          if (c === '-' && (direction === DIR.UP || direction === DIR.DOWN)) {
            const splitStart = grid.navigator.step.right(current);
            const splitNavigator = makeNavigatorAt(splitStart, DIR.RIGHT, seen);
            splitNavigator();
            navigators.push(splitNavigator);
            direction = DIR.LEFT;
            return grid.navigator.step.left(current);
          }
          if (c === '|' && (direction === DIR.LEFT || direction === DIR.RIGHT)) {
            const splitStart = grid.navigator.step.up(current);
            const splitNavigator = makeNavigatorAt(splitStart, DIR.UP, seen);
            splitNavigator();
            navigators.push(splitNavigator);
            direction = DIR.DOWN;
            return grid.navigator.step.down(current);
          }
          if (c === '/') {
            if (direction === DIR.LEFT) {
              direction = DIR.DOWN;
              return grid.navigator.step.down(current);
            }
            if (direction === DIR.RIGHT) {
              direction = DIR.UP;
              return grid.navigator.step.up(current);
            }
            if (direction === DIR.UP) {
              direction = DIR.RIGHT;
              return grid.navigator.step.right(current);
            }
            if (direction === DIR.DOWN) {
              direction = DIR.LEFT;
              return grid.navigator.step.left(current);
            }
          }
          if (c === '\\') {
            if (direction === DIR.LEFT) {
              direction = DIR.UP;
              return grid.navigator.step.up(current);
            }
            if (direction === DIR.RIGHT) {
              direction = DIR.DOWN;
              return grid.navigator.step.down(current);
            }
            if (direction === DIR.UP) {
              direction = DIR.LEFT;
              return grid.navigator.step.left(current);
            }
            if (direction === DIR.DOWN) {
              direction = DIR.RIGHT;
              return grid.navigator.step.right(current);
            }
          }
          throw new Error();
        }),
        { seen: seen },
      );
    const seen = ds.setND<[row: number, col: number, direction: number]>();
    const first = makeNavigatorAt(startPoint, startDirection, seen);
    navigators.push(first);
    first();
  
    while (navigators.some((n) => n.current() !== undefined)) {
      navigators.forEach((navigator) => {
        if (navigator.current() !== undefined) {
          navigator();
        }
      });
    }

    const seenCoords = ds.setND<[row: number, col: number]>();
    seen.values().forEach(([row, col]) => {
      seenCoords.add([row, col]);
    });

    if (seenCoords.size > result) {
      result = seenCoords.size;
    }
  });

  return result;
}

const solution = solve(data);
log.write(solution);
