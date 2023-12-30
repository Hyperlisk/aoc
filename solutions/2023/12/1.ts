

import { array, comparator, ds, graph, grid, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 12);
const DATA = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.space, String)
);

function solve() {
  let result = 0;

  DATA.forEach(([record, expectedString]) => {
    const recordItems = record.split('');
    const expectedGroups = expectedString.split(',').map(Number);
    const damageMap: number[] = [];
    recordItems.forEach((c, idx) => {
      if (c === '?') {
        damageMap.push(idx);
      }
    });
    for (let i = 0;i < Math.pow(2, damageMap.length); i++) {
      damageMap.forEach((recordIdx, damageIdx) => {
        recordItems[recordIdx] = (i & (1 << damageIdx)) ? '#' : '.';
      });
      let size = 0;
      let inGroup = false;
      const foundGroups = [];
      for (let j = 0;j < recordItems.length;j++) {
        if (recordItems[j] === '#') {
          if (inGroup) {
            size += 1;
          } else {
            size = 1;
            inGroup = true;
          }
        }
        if (recordItems[j] === '.') {
          if (inGroup) {
            foundGroups.push(size);
            size = 0;
          }
          size = 0;
          inGroup = false;
        }
      }
      if (inGroup) {
        foundGroups.push(size);
      }
      if (expectedGroups.length === foundGroups.length && comparator.generic(expectedGroups, foundGroups) === 0) {
        result += 1;
      }
    }
  });

  return result;
}

const solution = solve();
log.write(solution);
