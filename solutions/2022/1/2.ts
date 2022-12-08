

import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2022, 1);
const data = input.parse(
  inputData,
  input.parse.split.group,
  (dataGroup: string) =>
    input.parse(dataGroup, input.parse.split.line, Number),
);

function solve(elves: Array<Array<number>>) {
  const elfCalories = elves.map(array.sum);
  const sortedElfCalories = elfCalories.sort((a, b) => a - b);
  const topElfCalories = sortedElfCalories.splice(-3, 3);
  return array.sum(topElfCalories);
}

const solution = solve(data);
log.write(solution);
