
import { input, log } from "@Hyperlisk/aoc-lib";

type InputType = [MATCH: string, A: number, B: number][][];

const inputData = await input.fetchProblemInput(2024, 3);
const data: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line: string) => Array.from(line.matchAll(/do\(\)|don't\(\)|mul\((\d+),(\d+)\)/g)).map((match) => [match[0], parseInt(match[1]), parseInt(match[2])]),
);

function solve() {
  let result = 0;
  let canMul = true;
  data.forEach((line) => {
    line.forEach(([MATCH, A, B]) => {
      if (MATCH === "do()") {
        canMul = true;
      } else if (MATCH === "don't()") {
        canMul = false;
      } else if (canMul) {
        result += A * B;
      }
    });
  });
  return result;
}

log.write(solve());
