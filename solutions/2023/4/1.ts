

import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 4);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) => line.split(': ')[1].split(' | ').map((nums) => input.parse(nums, input.parse.split.space, Number))
);


function solve(games: number[][][]) {
  let score = 0;
  games.forEach(([winningNums, myNums]) => {
    const winners = array.intersection(winningNums, myNums);
    if (winners.length) {
      score += 1 << (winners.length - 1);
    }
  });
  return score;
}

const solution = solve(data);
log.write(solution);
