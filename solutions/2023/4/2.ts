
import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 4);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) => line.split(': ')[1].split(' | ')
);


function solve(lines: string[][]) {
  let cards = lines.length;
  const muls: number[] = [];
  lines.forEach(([lineWinning, lineMine]) => {
    const winning = new Set(lineWinning.split(/\s+/));
    const mine = new Set(lineMine.split(/\s+/));
    const winners = (Array.from(mine.values()).filter((value) => winning.has(value)));
    const mul = 1 + (muls.shift() || 0);
    if (winners.length) {
      cards += mul * winners.length;
      array.range(0, winners.length).forEach((idx) => {
        muls[idx] = (muls[idx] | 0) + mul;
      });
    }
  });
  return cards;
}

const solution = solve(data);
log.write(solution);
