
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
    const [rangeOnePoints, rangeTwoPoints] = ranges;
    const rangeOne = array.virtualRange.inclusive(rangeOnePoints[0], rangeOnePoints[1]);
    const [rangeOneStart, rangeOneEnd] = [rangeOne[0], rangeOne[rangeOne.length - 1]];
    const rangeTwo = array.virtualRange.inclusive(rangeTwoPoints[0], rangeTwoPoints[1]);
    const [rangeTwoStart, rangeTwoEnd] = [rangeTwo[0], rangeTwo[rangeTwo.length - 1]];
    const hasAnyOverlap =
      (rangeOneStart >= rangeTwoStart && rangeOneStart <= rangeTwoEnd) ||
      (rangeOneEnd >= rangeTwoStart && rangeOneEnd <= rangeTwoEnd) ||
      (rangeTwoStart >= rangeOneStart && rangeTwoStart <= rangeOneEnd) ||
      (rangeTwoEnd >= rangeOneStart && rangeTwoEnd <= rangeOneEnd);
    if (hasAnyOverlap) {
      result += 1;
    }
  });
  return result;
}

const solution = solve(data);
log.write(solution);
