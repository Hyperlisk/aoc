

import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 13);
const DATA = input.parse(
  inputData,
  input.parse.split.group,
  (line) => input.parse(line, input.parse.split.line, String)
);

function solve() {
  let result = 0;

  const findMirror = (rows: string[]) => {
    const seenRows = new Set<string>();
    for (let row = 0;row < rows.length;row++) {
      if (seenRows.has(rows[row])) {
        let mirror = true;
        for (let offset = 0;offset < row && row + offset < rows.length;offset++) {
          if (rows[row + offset] !== rows[row - offset - 1]) {
            mirror = false;
            break;
          }
        }
        if (mirror) {
          return 100 * row;
        }
      }
      seenRows.add(rows[row]);
    }
    const cols = array.zip(...rows.map((row) => row.split(''))).map((col) => array.realize(col).join(''));
    const seenCols = new Set<string>();
    for (let col = 0;col < cols.length;col++) {
      if (seenCols.has(cols[col])) {
        let mirror = true;
        for (let offset = 0;offset < col && col + offset < cols.length;offset++) {
          if (cols[col + offset] !== cols[col - offset - 1]) {
            mirror = false;
            break;
          }
        }
        if (mirror) {
          return col;
        }
      }
      seenCols.add(cols[col]);
    }
    return 0;
  };
  
  DATA.forEach((group) => {
    result += findMirror(group);
  });

  return result;
}

log.write(solve());
