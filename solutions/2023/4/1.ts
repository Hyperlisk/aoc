

import { input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 4);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) => line.split(': ')[1].split(' | ')
);


function solve(lines: string[][]) {
  let score = 0;
  lines.forEach(([lineWinning, lineMine]) => {
    const winning = new Set(lineWinning.split(/\s+/));
    const mine = new Set(lineMine.split(/\s+/));
    const winners = (Array.from(mine.values()).filter((value) => winning.has(value)));
    if (winners.length) {
      score += 1 << (winners.length - 1);
    }
  });
  return score;
}

const solution = solve(data);
log.write(solution);
