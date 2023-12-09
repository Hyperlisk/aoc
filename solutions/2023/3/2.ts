

import { ds, grid, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 3);
const DATA = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, String)
);


function solve(data: typeof DATA) {
  let partNumberId = 0;
  type PartNumber = {
    id: number;
    value: number;
  };
  const items = grid.identify(data, {
    partNumbers: /\d/,
    parts: /[^.\d]/,
  });
  const numberMap = ds.mapND<[number, number], PartNumber>();
  items.partNumbers?.forEach((partNumberInfo) => {
    const partNumber: PartNumber = {
      id: partNumberId++,
      value: Number(partNumberInfo.joined),
    };
    partNumberInfo.coords.values().forEach(([rowIdx, colIdx]) => {
      numberMap.set([rowIdx, colIdx], partNumber);
    });
  });

  let sum = 0;
  items.parts?.forEach((partInfo) => {
    const [partRow, partCol] = partInfo.coords.values()[0];
    const part = data[partRow][partCol];
    if (part !== '*') {
      // Not a gear
      return;
    }
    const neighborPartNumbers: Set<PartNumber> = new Set();
    grid.neighbors.all(grid.at(partRow, partCol)).forEach((adjacent) => {
      const partNumber = numberMap.get([adjacent.row, adjacent.col]);
      if (partNumber === undefined || neighborPartNumbers.has(partNumber)) {
        return;
      }
      neighborPartNumbers.add(partNumber);
    });

    if (neighborPartNumbers.size === 2) {
      const [{ value: partNumberA }, { value: partNumberB }] = Array.from(neighborPartNumbers.values());
      sum += partNumberA * partNumberB;
    }
  });
  return sum;
}

const solution = solve(DATA);
log.write(solution);
