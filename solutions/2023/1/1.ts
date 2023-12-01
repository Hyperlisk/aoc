

import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 1);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line: string) =>
    input.parse(line, input.parse.split.character, Number),
);

function firstNumberFromLeft(arr: number[]): number {
  for (let i = 0;i < arr.length;i++) {
    if (!isNaN(arr[i])) {
      return arr[i];
    }
  }
  throw new Error('No number from left');
}

function firstNumberFromRight(arr: number[]): number {
  for (let i = arr.length - 1;i >= 0;i--) {
    if (!isNaN(arr[i])) {
      return arr[i];
    }
  }
  throw new Error('No number from right');
}

function solve(lines: Array<Array<number>>) {
  return array.sum(lines.map((line) => {
    const left = firstNumberFromLeft(line);
    const right = firstNumberFromRight(line);
    return parseInt(`${left}${right}`, 10);
  }));
}

const solution = solve(data);
log.write(solution);
