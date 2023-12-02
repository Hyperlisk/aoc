

import { input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 2);
const data: [string, string[][][]][] = inputData.split("\n").filter(Boolean)
  .map((line: string) => {
    const [gameId, results] = line.split(': ');
    return [gameId.split(' ')[1], results.split('; ').map((result) => result.split(', ').map((game) => game.split(' ')))];
  }
  );

function solve(lines: [string, string[][][]][]) {
  let result = 0;
  lines.forEach(([, line]) => {
    let maxRed = 0;
    let maxGreen = 0;
    let maxBlue = 0;
    line.forEach((game) => {
      game.forEach(([amount, color]) => {
        if (color === 'red' && +amount > maxRed) {
          maxRed = +amount;
        }
        if (color === 'green' && +amount > maxGreen) {
          maxGreen = +amount;
        }
        if (color === 'blue' && +amount > maxBlue) {
          maxBlue = +amount;
        }
      });
    });
    result += maxRed * maxGreen * maxBlue;
  });
  return result;
}

const solution = solve(data);
log.write(solution);
