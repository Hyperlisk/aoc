
import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2022, 4);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (dataLine: string) =>
    input.parse(dataLine, ",", String).map(range => input.parse(range, "-", Number)),
);

function solve(rangesList: Array<Array<Array<number>>>) {
  let result = 0;
  rangesList.forEach(ranges => {
    const [[rangeOneStart, rangeOneEnd], [rangeTwoStart, rangeTwoEnd]] = ranges;
    const hasCompleteOverlap =
      (rangeOneStart >= rangeTwoStart && rangeOneStart <= rangeTwoEnd && rangeOneEnd >= rangeTwoStart && rangeOneEnd <= rangeTwoEnd) ||
      (rangeTwoStart >= rangeOneStart && rangeTwoStart <= rangeOneEnd && rangeTwoEnd >= rangeOneStart && rangeTwoEnd <= rangeOneEnd);
    if (hasCompleteOverlap) {
      result += 1;
    }
  });
  return result;
}

const solution = solve(data);
log.write(solution);
