

import { array, fn, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 12);
const DATA = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.space, String)
);


function solve() {
  let result = 0;

  DATA.forEach(([record, expectedString]) => {
    const recordItems = array.head(array.duplicate([...record.split(''), '?'], 5), -1);
    const expectedGroups = array.duplicate(expectedString.split(',').map(Number), 5);
    // const recordItems = record.split('');
    // const expectedGroups = expectedString.split(',').map(Number);

    const nextDamagedFrom: Record<number, number> = {};
    const nextSpaceFrom: Record<number, number> = {};
    const nextUnknownFrom: Record<number, number> = {};
    // Starting at recordItems.length (instead of minus one) on purpose
    for (let i = recordItems.length, nextUnknown = -1, nextSpace = -1, nextDamaged = -1;i >= 0;i--) {
      if (nextDamaged !== -1) {
        nextDamaged += 1;
      }
      nextDamagedFrom[i] = nextDamaged;
      if (recordItems[i] === '#') {
        nextDamaged = 0;
      }
      if (nextSpace !== -1) {
        nextSpace += 1;
      }
      nextSpaceFrom[i] = nextSpace;
      if (recordItems[i] === '.') {
        nextSpace = 0;
      }
      if (nextUnknown !== -1) {
        nextUnknown += 1;
      }
      nextUnknownFrom[i] = nextUnknown;
      if (recordItems[i] === '?') {
        nextUnknown = 0;
      }
    }

    const findNext = fn.memoize((recordIdx: number, expectedIdx: number, currentSize: number): number => {
      // log.write(recordIdx, expectedIdx, currentSize);

      const hasCurrentExpected = currentSize === expectedGroups[expectedIdx];
      const hasAllExpected = hasCurrentExpected && expectedIdx + 1 === expectedGroups.length;

      if (hasAllExpected) {
        if (nextDamagedFrom[recordIdx - 1] === -1) {
          return 1;
        } else {
          return 0;
        }
      }

      const c = recordItems[recordIdx];

      if (hasCurrentExpected) {
        if (c === '#') {
          return 0;
        }
        return findNext(recordIdx + 1, expectedIdx + 1, 0);
      }

      if (c === '.') {
        if (currentSize === 0) {
          return findNext(recordIdx + 1, expectedIdx, currentSize);
        } else {
          return 0;
        }
      }

      if (c === '?') {
        if (currentSize === 0) {
          return findNext(recordIdx + 1, expectedIdx, currentSize) + findNext(recordIdx + 1, expectedIdx, currentSize + 1);
        } else {
          return findNext(recordIdx + 1, expectedIdx, currentSize + 1);
        }
      }

      if (c === '#') {
        return findNext(recordIdx + 1, expectedIdx, currentSize + 1);
      }

      return 0;
    });

    result += findNext(0, 0, 0);
  });

  return result;
}

const solution = solve();
log.write(solution);
