
import { comparator, input, log } from "@Hyperlisk/aoc-lib";

type InputType = [ORDER: [A: number, B: number][], UPDATES: number[][]];

const inputData = await input.fetchProblemInput(2024, 5);
const data: InputType = input.parse(
  inputData,
  input.parse.split.group,
  (group: string) => input.parse(group, input.parse.split.line, (line) => line.split(/[,|]/).map((n) => parseInt(n))),
) as InputType;

function solve() {
  let result = 0;

  let cmp: typeof comparator.generic<number> = (a, b) => {
    return comparator.numbers(a, b);
  };
  const [ORDER, UPDATES] = data;
  ORDER.forEach(([A, B]) => {
    const oldCmp = cmp;
    cmp = (a, b) => {
      if (a === A && b === B) {
        return -1;
      }
      if (a === B && b === A) {
        return 1;
      }
      return oldCmp(a, b);
    };
  });
  UPDATES.forEach((update) => {
    const clone = update.slice(0);
    clone.sort(cmp);
    if (comparator.generic(update, clone) === 0) {
      result += update[(update.length - 1) >> 1];
    }
  });
  return result;
}

log.write(solve());
