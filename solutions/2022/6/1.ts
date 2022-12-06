
import { array, input, log, string } from "@Hyperlisk/aoc-lib";

type InputType = Array<string>;

const inputData = await input.fetchProblemInput(2022, 6);
const parsedInput: InputType = input.parse(inputData, input.parse.split.character, String);

const WINDOW_SIZE = 4;

function solve(input: InputType) {
  let windowUniqueCount = 0;

  const windows = array.window(input, WINDOW_SIZE);
  for (let windowIdx = 0;windowIdx < windows.length;windowIdx++) {
    const windowSet = new Set(windows[windowIdx]);
    if (windowSet.size === WINDOW_SIZE) {
      return WINDOW_SIZE + windowIdx;
    }
  }

  throw new Error("Could not find a window with all unique characters.");
}

log.write(solve(parsedInput));
