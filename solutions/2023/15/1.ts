

import { array, comparator, grid, input, log, virtual } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 15);
const DATA = input.parse(
  inputData,
  input.parse.split.line,
  String
);

function hash(s: string) {
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    result += s.charCodeAt(i);
    result *= 17;
    result %= 256;
  }
  return result;
}

if (hash('HASH') !== 52) {
  throw new Error('hash val');
}


function solve(data: typeof DATA) {
  let result = 0;
  for (const line of data) {
    result += array.sum(line.split(',').map(hash));
  }
  return result;
}

const solution = solve(DATA);
log.write(solution);
