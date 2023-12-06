

import { array, comparator, input, log, virtual } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 6);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) =>
    input
      .parse(line, input.parse.split.space, String)
      .slice(1)
      .map(Number)
);


function solve(raceInfo: number[][]) {
  const [times, distances] = raceInfo;
  return array.zip(times, distances)
    .map(([maxTime, recordDistance]) => {
      const hasMiddle = (maxTime % 2) === 0;
      // After half we start going down. Only consider half the array so we have a view of "sorted" values.
      const possibleResults = virtual.array((timeHeld) => timeHeld * (maxTime - timeHeld), hasMiddle ? maxTime / 2 + 1 : (maxTime + 1) / 2);
      // Find where we would start breaking records.
      const winsStart = array.binary(possibleResults, recordDistance + 1, comparator.numbers);
      // Double our results because it is mirrored and we were only considering half of the array.
      return 2 * (possibleResults.length - winsStart) - (hasMiddle ? 1 : 0);
    })
    .reduce((a, n) => a * n, 1);
}

const solution = solve(data);
log.write(solution);
