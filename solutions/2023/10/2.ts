

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

  const path = [S];
  let last = S;
  while (true) {
    const next = findNextNeighbor(last);
    if (next === null) {
      break;
    }
    seen.add([next.row, next.col]);
    path.push(next);
    last = next;
  }

  const firstPipe = (() => {
    for (let row = 0;row < data.length;row++) {
      for (let col = 0;col < COLS;col++) {
        if (seen.has([row, col])) {
          return grid.at(row, col);
        }
      }
    }
    throw new Error();
  })();
  const firstPipeIndex = path.findIndex((v) => v.row === firstPipe.row && v.col === firstPipe.col);
  const afterFirstPipe = path[firstPipeIndex + 1];
  const firstPipeOffset = grid.offset(firstPipe, afterFirstPipe);
  const clockwise = (() => {
    if (firstPipeOffset.rowOffset === 1 && firstPipeOffset.colOffset === 0) {
      // Continued down, meaning we are going counter-clockwise
      return false;
    }
    if (firstPipeOffset.rowOffset === 0 && firstPipeOffset.colOffset === 1) {
      // Continued right, meaning we are going clockwise
      return true;
    }
    throw new Error();
  })();
  
  const possibleInside = ds.setND<[row: number, col: number]>();
  for (let i = 1;i <= path.length;i++) {
    const last = path[i - 1];
    const l = data[last.row][last.col];
    const lastWasTurn = l === 'F' || l === '7' || l === 'J' || l === '7';
    const current = path[i] || path[0];
    const offset = grid.offset(last, current);
    if (offset.rowOffset === -1 && offset.colOffset === 0) {
      possibleInside.add(clockwise ? [current.row, current.col + 1] : [current.row, current.col - 1]);
      if (lastWasTurn) {
        possibleInside.add(clockwise ? [last.row, last.col + 1] : [last.row, last.col - 1]);
      }
    }
    if (offset.rowOffset === 1 && offset.colOffset === 0) {
      possibleInside.add(clockwise ? [current.row, current.col - 1] : [current.row, current.col + 1]);
      if (lastWasTurn) {
        possibleInside.add(clockwise ? [last.row, last.col - 1] : [last.row, last.col + 1]);
      }
    }
    if (offset.rowOffset === 0 && offset.colOffset === -1) {
      possibleInside.add(clockwise ? [current.row - 1, current.col] : [current.row + 1, current.col]);
      if (lastWasTurn) {
        possibleInside.add(clockwise ? [last.row - 1, last.col] : [last.row + 1, last.col]);
      }
    }
    if (offset.rowOffset === 0 && offset.colOffset === 1) {
      possibleInside.add(clockwise ? [current.row + 1, current.col] : [current.row - 1, current.col]);
      if (lastWasTurn) {
        possibleInside.add(clockwise ? [last.row + 1, last.col] : [last.row - 1, last.col]);
      }
    }
  }

  const inside = ds.setND<[row: number, col: number]>();
  const fill = (from: grid.GridPoint) => {
    const remaining = [from];
    while (remaining.length) {
      const current = remaining.pop()!;
      const key: [row: number, col: number] = [current.row, current.col];
      if (seen.has(key) || inside.has(key)) {
        continue;
      }
      inside.add(key);
      const neighbors = grid.neighbors.all(current, { rows: ROWS, cols: COLS});
      for (let i = 0;i < neighbors.length;i++) {
        remaining.push(neighbors[i]);
      }
    }
  };

  possibleInside.values().forEach(([row, col]) => {
    fill(grid.at(row, col));
  });

  // const ll: string[] = [];
  // for (let row = 0;row < ROWS;row++) {
  //   ll.splice(0, ll.length);
  //   for (let col = 0;col < COLS;col++) {
  //     const cell = grid.at(row, col);
  //     const n: [row: number, col: number] = [cell.row, cell.col];
  //     ll.push(seen.has(n) ? (data[row][col] === 'L' ? '└' : data[row][col] === 'J' ? '┘' : data[row][col] === '7' ? '┐' : data[row][col] === 'F' ? '┌' : data[row][col] === '-' ? '─' : '│') : inside.has(n) ? 'I' : possibleInside.has(n) ? '?' : 'O');
  //   }
  //   log.write(ll.join(''));
  // }

  result = inside.size;

  return result;
}

const solution = solve();
log.write(solution);
