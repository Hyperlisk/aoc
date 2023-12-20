

import { array, ds, fn, grid, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 11);
const GRID = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, String)
);
const ROWS = GRID.length;
const COLS = GRID[0].length;

type RC = [row: number, col: number];


function solve() {
  let result = 0;

  const parts = grid.identify(GRID, {
    galaxy: '#',
  });
  const galaxies = parts.galaxy || [];
  
  const emptyCols = ds.setND<[number]>();
  array.range(0, COLS).forEach((n) => {
    emptyCols.add([n]);
  });
  const emptyRows = ds.setND<[number]>();
  array.range(0, ROWS).forEach((n) => {
    emptyRows.add([n]);
  });
  galaxies.forEach((galaxy) => {
    galaxy.coords.values().forEach(([row, col]) => {
      emptyCols.delete([col]);
      emptyRows.delete([row]);
    });
  });

  const sortedEmptyCols = emptyCols.values().flat();
  const sortedEmptyRows = emptyRows.values().flat();

  const modifiedTaxi = fn.memoize(([rowA, colA]: RC, [rowB, colB]: RC) => {
    const basicTaxi = grid.taxi(grid.at(rowA, colA), grid.at(rowB, colB));
    const idxRowLow = array.binary(sortedEmptyRows, rowA < rowB ? rowA : rowB);
    const idxRowHigh = array.binary(sortedEmptyRows, rowA > rowB ? rowA : rowB);
    const idxColLow = array.binary(sortedEmptyCols, colA < colB ? colA : colB);
    const idxColHigh = array.binary(sortedEmptyCols, colA > colB ? colA : colB);
    return basicTaxi + (idxColHigh - idxColLow) + (idxRowHigh - idxRowLow);
  });

  for (let i = 0;i < galaxies.length;i++) {
    for (let j = i + 1;j < galaxies.length;j++) {
      result += modifiedTaxi(galaxies[i].coords.values()[0], galaxies[j].coords.values()[0]);
    }
  }

  return result;
}

log.write(solve());
