
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
    const rangeOne = array.range.inclusive(rangeOnePoints[0], rangeOnePoints[1]);
    const rangeTwo = array.range.inclusive(rangeTwoPoints[0], rangeTwoPoints[1]);
    const intersection = array.intersection(rangeOne, rangeTwo);
    if (intersection.length > 0) {
      result += 1;
    }
  });
  return result;
}

const solution = solve(data);
log.write(solution);
