
import { input, log } from "@Hyperlisk/aoc-lib";

type InputType = [A: number, B: number][][];

const inputData = await input.fetchProblemInput(2024, 3);
const data: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line: string) => Array.from(line.matchAll(/mul\((\d+),(\d+)\)/g)).map((match) => [parseInt(match[1]), parseInt(match[2])]),
);

function solve() {
  let result = 0;
  data.forEach((line) => {
    line.forEach(([A, B]) => {
      result += A * B;
    });
  });
  return result;
}

log.write(solve());
