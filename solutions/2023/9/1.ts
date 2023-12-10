

import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 9);
const DATA = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.space, Number)
);


function solve(data: typeof DATA) {
  let result = 0;
  data.forEach((history) => {
    const ends = [history[history.length - 1]];
    let deriving = true;
    let last = history;
    while (deriving) {
      const next: number[] = [];
      let zero = true;
      for (let i = 1;i < last.length;i++) {
        const val = last[i] - last[i - 1];
        zero = zero && val === 0;
        next.push(val);
      }
      ends.push(next[next.length - 1]);
      last = next;
      if (zero) {
        deriving = false;
      }
    }
    result += array.sum(ends);
  });
  return result;
}

const solution = solve(DATA);
log.write(solution);
