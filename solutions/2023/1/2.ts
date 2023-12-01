

import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 1);
const data = input.parse(inputData, input.parse.split.line, String);

const NUMBER_RX = /(0|1|2|3|4|5|6|7|8|9|one|two|three|four|five|six|seven|eight|nine)/;
const NUMBER_MAP: Record<string, number> = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'one': 1,
  'two': 2,
  'three': 3,
  'four': 4,
  'five': 5,
  'six': 6,
  'seven': 7,
  'eight': 8,
  'nine': 9,
};

function firstNumberFromLeft(line: string): number {
  for (let end = 1;end <= line.length;end++) {
    const part = line.substring(0, end);
    const number = part.match(NUMBER_RX);
    if (number !== null) {
      return NUMBER_MAP[number[0]];
    }
  }
  throw new Error('No number from left');
}

function firstNumberFromRight(line: string): number {
  for (let start = line.length - 1;start >= 0;start--) {
    const part = line.substring(start);
    const number = part.match(NUMBER_RX);
    if (number !== null) {
      return NUMBER_MAP[number[0]];
    }
  }
  throw new Error('No number from right');
}

function solve(lines: string[]) {
  return array.sum(lines.map((line) => {
    const left = firstNumberFromLeft(line);
    const right = firstNumberFromRight(line);
    return parseInt(`${left}${right}`, 10);
  }));
}

const solution = solve(data);
log.write(solution);
