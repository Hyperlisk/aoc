
import { input, log, virtual } from "@Hyperlisk/aoc-lib";

type InputType = Array<Array<string>>;

const inputData = await input.fetchProblemInput(2022, 7);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => line.split(' '),
);

function solve(input: InputType) {
  let command: null | string = null;
  let currentDirectory: null | string = null;
  const fs: Record<string, number> = {};
  const totalSize = 70000000;
  const requiredSize = 30000000;
  for (const line of input) {
    if (line[0] === '$') {
      command = line[1];
      switch (command) {
        case 'cd':
          currentDirectory =
            line[2] === '..'
              ? currentDirectory.substr(0, currentDirectory.lastIndexOf('/'))
              : line[2] === '/'
                ? ''
                : `${currentDirectory}/${line[2]}`;
          break;
        case 'ls':
          break;
      }
    } else {
      // This is output to the previous command.
      if (command === 'ls') {
        if (line[0] !== 'dir') {
          const size = parseInt(line[0], 10);
          const dirParts = currentDirectory.split('/');
          const directories = virtual.array((idx) => dirParts.slice(0, idx + 1).join('/') || '/', dirParts.length);
          for (const directory of directories) {
            fs[directory] = (fs[directory] || 0) + size;
          }
        }
      }
    }
  }
  let minMatchingSize = Infinity;
  for (const directory of Object.keys(fs)) {
    if (fs[directory] >= requiredSize - (totalSize - fs['/']) && fs[directory] <= minMatchingSize) {
      minMatchingSize = fs[directory];
    }
  }
  return minMatchingSize;
}

log.write(solve(parsedInput));
