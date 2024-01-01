

import { array, ds, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 13);
const DATA = input.parse(
  inputData,
  input.parse.split.group,
  (line) => input.parse(line, input.parse.split.line, String)
);

type RC = [row: number, col: number];


function solve() {
  let result = 0;

  const findMirror = (rows: string[], cols: string[], type: "row" | "col", ignore: number) => {
    if (type === "row") {
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
          if (mirror && ignore !== 100 * row) {
            return 100 * row;
          }
        }
        seenRows.add(rows[row]);
      }
    }
    if (type === "col") {
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
          if (mirror && ignore !== col) {
            return col;
          }
        }
        seenCols.add(cols[col]);
      }
    }
    return 0;
  };
  
  DATA.forEach((rows) => {
    const potentialSmudges = ds.setND<[RC, "row" | "col"]>();
    for (let rowA = 0;rowA < rows.length;rowA++) {
      for (let rowB = 0;rowB < rows.length;rowB++) {
        let smudge: RC | null = null;
        for (let col = 0;col < rows[0].length;col++) {
          if (rows[rowA][col] !== rows[rowB][col]) {
            if (smudge) {
              smudge = null;
              break;
            }
            smudge = [rowA, col];
          }
        }
        if (smudge !== null) {
          potentialSmudges.add([smudge, "row"]);
        }
      }
    }

    const cols = array.zip(...rows.map((row) => row.split(''))).map((col) => array.realize(col).join(''));
    for (let colA = 0;colA < cols.length;colA++) {
      for (let colB = 0;colB < cols.length;colB++) {
        let smudge: RC | null = null;
        for (let row = 0;row < cols[0].length;row++) {
          if (cols[colA][row] !== cols[colB][row]) {
            if (smudge) {
              smudge = null;
              break;
            }
            smudge = [row, colA];
          }
        }
        if (smudge !== null) {
          potentialSmudges.add([smudge, "col"]);
        }
      }
    }

    const preSmudge = findMirror(rows, cols, "row", 0) || findMirror(rows, cols, "col", 0);
    const potentialResults = new Set<number>();
    // log.write(' === GATHER');
    potentialSmudges.values().forEach(([[row, col], type]) => {
      const rowsCopy = rows.slice(0);
      rowsCopy[row] = rowsCopy[row]
        .split('')
        .map((c, idx) => idx !== col ? c : c === '.' ? '#' : '.')
        .join('');
      const colsCopy = cols.slice(0);
      colsCopy[col] = colsCopy[col]
        .split('')
        .map((c, idx) => idx !== row ? c : c === '.' ? '#' : '.')
        .join('');
      const res = findMirror(rowsCopy, colsCopy, type, preSmudge);
      if (res) {
        potentialResults.add(res);
      }
    });
    const possible = Array.from(potentialResults.values());
    if (possible.length !== 1) {
      throw new Error(`Not just one result: ${possible}\n${rows.join("\n")}`);
    }

    result += possible[0];
  });

  return result;
}

log.write(solve());
