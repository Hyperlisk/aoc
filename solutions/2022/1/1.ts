

import { input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2022, 1, 1);
const data = input.parse<Array<number>>(
  inputData,
  (dataGroup: string) => {
    return input.parse<number>(dataGroup, Number, input.parse.split.line);
  },
  input.parse.split.group,
)

const sum = (numbers: Array<number>) => numbers.reduce((total, n) => total + n, 0);

function solve(elves: Array<Array<number>>) {
  let greatestCalories = -1;
  elves.forEach((elf, elfIdx) => {
    const calories = sum(elf);
    if (calories > greatestCalories) {
      greatestCalories = calories;
    }
  });
  return greatestCalories;
}

const solution = solve(data);
log.write(solution);
