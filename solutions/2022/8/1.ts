
import { array, grid, input, log, point, virtual } from "@Hyperlisk/aoc-lib";

type InputType = Array<Array<number>>;

const inputData = await input.fetchProblemInput(2022, 8);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, Number),
);

function solve(input: InputType) {
  const numberOfColumns = input[0].length;
  const numberOfRows = input.length;

  const visibleTrees = new point.set<grid.GridPoint>();

  array.concat(
    // Top-Bottom Coordinates
    virtual.array(
      (idx) => virtual.array(grid.navigator(grid.at(0, idx), grid.navigator.step.down), numberOfRows),
      numberOfColumns,
    ),
    // Bottom-Top Coordinates
    virtual.array(
      (idx) => virtual.array(grid.navigator(grid.at(numberOfRows - 1, idx), grid.navigator.step.up), numberOfRows),
      numberOfColumns,
    ),
    // Left-Right Coordinates
    virtual.array(
      (idx) => virtual.array(grid.navigator(grid.at(idx, 0), grid.navigator.step.right), numberOfColumns),
      numberOfColumns,
    ),
    // Right-Left Coordinates
    virtual.array(
      (idx) => virtual.array(grid.navigator(grid.at(idx, numberOfColumns - 1), grid.navigator.step.left), numberOfColumns),
      numberOfColumns,
    ),
  )
    .forEach((gridPoints) => {
      let tallestHeight = -1;
      gridPoints.forEach((gridPoint) => {
        const treeHeight = input[gridPoint.row][gridPoint.col];
        if (treeHeight > tallestHeight) {
          tallestHeight = treeHeight;
          visibleTrees.add(gridPoint);
        }
      });
    });

  return visibleTrees.size;
}

log.write(solve(parsedInput));
