
import { input, log } from "@Hyperlisk/aoc-lib";

type InputType = number[][];

const inputData = await input.fetchProblemInput(2024, 2);
const data: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line: string) =>
    input.parse(line, input.parse.split.space, Number),
);

function solve() {
  let result = 0;
  data.forEach((report) => {
    if (report[0] < report[1]) {
      for (let i = 1;i < report.length;i++) {
        const diff = report[i] - report[i - 1];
        if (diff < 1 || diff > 3) {
          return;
        }
      }
    } else if (report[0] > report[1]) {
      for (let i = 1;i < report.length;i++) {
        const diff = report[i - 1] - report[i];
        if (diff < 1 || diff > 3) {
          return;
        }
      }
    } else {
      return;
    }
    result += 1;
  });
  return result;
}

log.write(solve());
