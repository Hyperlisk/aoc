

import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2022, 1);
const data = input.parse(
  inputData,
  input.parse.split.group,
  (dataGroup: string) =>
    input.parse(dataGroup, input.parse.split.line, Number),
);

function solve(elves: Array<Array<number>>) {
  return array.max(elves.map(array.sum));
}

const solution = solve(data);
log.write(solution);
