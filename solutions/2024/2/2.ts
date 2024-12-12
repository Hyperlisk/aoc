
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
  const matches = (report: number[], mode: "ascending" | "descending") => {
    for (let i = 1, lastIdx = 0, didSkip = false;i < report.length;i++) {
      const diff = (() => {
        if (mode === "ascending") {
          return report[i] - report[lastIdx];
        }
        if (mode === "descending") {
          return report[lastIdx] - report[i];
        }
        return -1;
      })();
      if (diff < 1 || diff > 3) {
        if (didSkip) {
          return false;
        } else {
          didSkip = true;
          continue;
        }
      } else {
        lastIdx = i;
      }
    }
    return true;
  };

  data.forEach((report) => {
    const reversed = report.slice();
    reversed.reverse();
    if (matches(report, "ascending") || matches(report, "descending") || matches(reversed, "descending") || matches(reversed, "ascending")) {
      result += 1;
    }
  });
  return result;
}

log.write(solve());
