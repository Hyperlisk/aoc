
import { grid, input, log } from "@Hyperlisk/aoc-lib";

type InputType = Array<Array<number>>;

const inputData = await input.fetchProblemInput(2022, 8);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, Number),
);

function getScenicScore(input: InputType, row: number, col: number) {
  const maxTreeHeight = input[row][col];

  function count(navigate: ReturnType<typeof grid.navigator>): number {
    let result = 0;
    navigate.while(
      (gridPoint) => {
        const { col, row } = gridPoint;
        if (col < 0 || row < 0 || row >= input.length || col >= input[row].length) {
          return false;
        }
        return true;
      },
      (gridPoint) => {
        result += 1;
        const treeHeight = input[gridPoint.row][gridPoint.col];
        if (treeHeight >= maxTreeHeight) {
          return true;
        }
      },
    );
    return result;
  }

  const scoreLeft = count(grid.navigator({ col: col - 1, row }, grid.navigator.step.left));
  const scoreDown = count(grid.navigator({ col, row: row + 1 }, grid.navigator.step.down));
  const scoreUp = count(grid.navigator({ col, row: row - 1 }, grid.navigator.step.up));
  const scoreRight = count(grid.navigator({ col: col + 1, row }, grid.navigator.step.right));

  return scoreLeft * scoreDown * scoreUp * scoreRight;
}

function solve(input: InputType) {
  let highestScenicScore = -1;

  input.forEach((rows, rowIdx) => {
    rows.forEach((treeHeight, colIdx) => {
      const scenicScore = getScenicScore(input, rowIdx, colIdx);
      if (scenicScore > highestScenicScore) {
        highestScenicScore = scenicScore;
      }
    });
  });

  return highestScenicScore;
}

log.write(solve(parsedInput));
