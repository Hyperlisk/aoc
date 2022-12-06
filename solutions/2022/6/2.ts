
import { array, input, log, string } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2022, 6);

function solve(input: string) {
  const window = [];
  const windowSeenCount = {};
  let windowUniqueCount = 0;
  for (let i = 0;i < input.length;i++) {
    if (window.length === 4) {
      const [el] = window.splice(0, 1);
      windowSeenCount[el] -= 1;
      if (windowSeenCount[el] === 0) {
        delete windowSeenCount[el];
        windowUniqueCount -= 1;
      }
    }
    const el = input[i];
    window.push(el);
    windowUniqueCount += (el in windowSeenCount) ? 0 : 1;
    windowSeenCount[el] = (windowSeenCount[el] || 0) + 1;
    if (window.length < 4) {
      continue;
    }
    if (windowUniqueCount === 4) {
      return i + 1;
    }
  }
}

const solution = solve(inputData);
log.write(solution);
