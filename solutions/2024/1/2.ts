
import { array, input, log } from "@Hyperlisk/aoc-lib";

type InputType = [L: number, R: number][];

const inputData = await input.fetchProblemInput(2024, 1);
const data: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line: string) =>
    input.parse(line, input.parse.split.space, Number) as [L: number, R: number],
);

function solve() {
  const [L, R] = array.zip(...data);

  const counts = array.count(R);

  let result = 0;
  L.forEach((l) => {
    const appearancesInR = counts.byItem.get(l) || 0;
    result += l * appearancesInR;
  });
  return result;
}

log.write(solve());
