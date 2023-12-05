

import { array, comparator, ds, grid, input, log, string } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 3);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, String)
);


function solve(lines: string[][]) {
  let partNumberId = 0;
  type PartNumber = {
    id: number;
    colStart: number;
    colEnd: number;
    row: number;
    value: number;
  };
  const numberMap = ds.mapND<[number, number], PartNumber>();
  type Part = [row: number, col: number];
  const partList: Part[] = [];
  lines.forEach((line, rowIdx) => {
    let n = 0;
    let nStart = 0;
    line.forEach((char, colIdx) => {
      if (string.is.digit(char)) {
        n = 10 * n + parseInt(char, 10);
        const partNumber: PartNumber = {
          id: partNumberId++,
          colStart: nStart,
          colEnd: colIdx + 1,
          row: rowIdx,
          value: n,
        };
        array.range(partNumber.colStart, partNumber.colEnd).forEach((col) => {
          // log.write('Setting', [rowIdx, col], 'to', partNumber);
          numberMap.set([rowIdx, col], partNumber);
        });
      } else {
        nStart = colIdx + 1;
        n = 0;
        if (char !== '.') {
          partList.push([rowIdx, colIdx]);
        }
      }
    });
  });

  let sum = 0;
  // log.write('Found', partList.length, 'parts');
  partList.forEach(([partRow, partCol]) => {
    const part = lines[partRow][partCol];
    if (part !== '*') {
      // Not a gear
      return;
    }
    // log.write([partRow, partCol], lines[partRow][partCol]);
    const neighborPartNumbers: PartNumber[] = [];
    const countedParts = new Set<number>();
    grid.neighbors.all(grid.at(partRow, partCol)).forEach((adjacent) => {
      const partNumber = numberMap.get([adjacent.row, adjacent.col]);
      // log.write('Checking ', [adjacent.row, adjacent.col], ', neighbor for', [partRow, partCol], ':', partNumber);
      if (partNumber === undefined || countedParts.has(partNumber.id)) {
        return;
      }
      // log.write('Adding ', partNumber.value, 'to sum');
      neighborPartNumbers.push(partNumber);
      countedParts.add(partNumber.id);
    });

    if (neighborPartNumbers.length === 2) {
      const [{ value: partNumberA }, { value: partNumberB }] = neighborPartNumbers;
      sum += partNumberA * partNumberB;
    }
  });
  return sum;
}

const solution = solve(data);
log.write(solution);
