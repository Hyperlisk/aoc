
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
  const [unsortedL, unsortedR] = array.zip(...data);
  const L = array.realize(unsortedL).sort();
  const R = array.realize(unsortedR).sort();

  let result = 0;
  L.forEach((l, idx) => {
    const r = R[idx];
    result += Math.abs(r - l);
  });
  return result;
}

log.write(solve());
