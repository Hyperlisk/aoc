
import { grid, input, log, virtual } from "@Hyperlisk/aoc-lib";

type InputType = Array<Array<number>>;

const inputData = await input.fetchProblemInput(2022, 8);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, Number),
);

function encodeCoordinate(row: number, col: number, numberOfColumns: number) {
  return row * numberOfColumns + col;
}

function solve(input: InputType) {
  const numberOfColumns = input[0].length;
  const numberOfRows = input.length;

  const visibleTrees: Set<number> = new Set();

  [
    // Top-Bottom Coordinates
    virtual.array(
      (idx) => Array.from(virtual.array(grid.navigator(input, { col: idx, row: 0 }, grid.navigator.step.down), numberOfRows)),
      numberOfColumns,
    ),
    // Bottom-Top Coordinates
    virtual.array(
      (idx) => Array.from(virtual.array(grid.navigator(input, { col: idx, row: numberOfRows - 1 }, grid.navigator.step.up), numberOfRows)),
      numberOfColumns,
    ),
    // Left-Right Coordinates
    virtual.array(
      (idx) => Array.from(virtual.array(grid.navigator(input, { col: 0, row: idx }, grid.navigator.step.right), numberOfColumns)),
      numberOfColumns,
    ),
    // Right-Left Coordinates
    virtual.array(
      (idx) => Array.from(virtual.array(grid.navigator(input, { col: numberOfColumns - 1, row: idx }, grid.navigator.step.left), numberOfColumns)),
      numberOfColumns,
    ),
  ]
    .forEach((gridPointsList) => {
      gridPointsList.forEach((gridPoints) => {
        let tallestHeight = -1;
        gridPoints.forEach(({ row, col }) => {
          const treeHeight = input[row][col];
          if (treeHeight > tallestHeight) {
            tallestHeight = treeHeight;
            visibleTrees.add(encodeCoordinate(row, col, numberOfColumns));
          }
        });
      });
    });

  return visibleTrees.size;
}

log.write(solve(parsedInput));