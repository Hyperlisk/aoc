

import { ds, grid, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 10);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, String)
);

function solve() {
  let result = 0;

  const ROWS = data.length;
  const COLS = data[0].length;
  const findNextNeighbor = (current: grid.GridPoint) => {
    const neighbors = grid.neighbors.adjacent(current, { rows: ROWS, cols: COLS});
    const c = data[current.row][current.col];
    for (let i = 0;i < neighbors.length;i++) {
      const neighbor = neighbors[i];
      const key: [row: number, col: number] = [neighbor.row, neighbor.col];
      if (seen.has(key)) {
        continue;
      }
      const next = data[neighbor.row][neighbor.col];
      if (neighbor.offset.rowOffset === -1 && neighbor.offset.colOffset === 0 && c !== '-' && c !== '7' && c !== 'F') {
        // Above us
        if (next === '7' || next === 'F' || next === '|') {
          // This connects to us.
          return neighbor;
        }
      }
      if (neighbor.offset.rowOffset === 1 && neighbor.offset.colOffset === 0 && c !== '-' && c !== 'J' && c !== 'L') {
        // Below us
        if (next === 'J' || next === 'L' || next === '|') {
          // This connects to us.
          return neighbor;
        }
      }
      if (neighbor.offset.rowOffset === 0 && neighbor.offset.colOffset === -1 && c !== '|' && c !== 'L' && c !== 'F') {
        // Left of us
        if (next === 'L' || next === 'F' || next === '-') {
          // This connects to us.
          return neighbor;
        }
      }
      if (neighbor.offset.rowOffset === 0 && neighbor.offset.colOffset === 1 && c !== '|' && c !== '7' && c !== 'J') {
        // Right of us
        if (next === '7' || next === 'J' || next === '-') {
          // This connects to us.
          return neighbor;
        }
      }
    }
    return null;
  };

  // Find S
  const S = (() => {
    for (let row = 0;row < data.length;row++) {
      const col = data[row].indexOf('S');
      if (col >= 0) {
        return grid.at(row, col);
      }
    }
    throw new Error();
  })();

  const seen = ds.setND<[row: number, col: number]>();
  seen.add([S.row, S.col]);

  let last = S;
  while (true) {
    const next = findNextNeighbor(last);
    if (next === null) {
      break;
    }
    // log.write(log.stringify(next), data[next.row][next.col], 'from', data[last.row][last.col]);
    seen.add([next.row, next.col]);
    last = next;
  }
  result = seen.values().length / 2;

  // log.write(log.stringify(seen));

  return result;
}

const solution = solve();
log.write(solution);
