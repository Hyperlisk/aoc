
import { grid, input, log } from "@Hyperlisk/aoc-lib";

type InputType = string[][];

const inputData = await input.fetchProblemInput(2024, 4);
const data: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line: string) => input.parse(line, input.parse.split.character, (c) => c),
);

function solve() {
  let result = 0;

  // Find location of "A" cells.
  // This is the center of our X-MAS.
  const parts = grid.identify(
    data,
    {
      aLocations: "A",
    },
  );

  // Map nodes in a directed way, making X -> M -> A -> S nodes.
  const getValidNeighbors = (point: grid.GridPoint): grid.GridPoint[] => {
    const allNeighbors = grid.neighbors.all(point, { cols: data[0].length, rows: data.length });
    const c = data[point.row][point.col];
    if (c === 'A') {
      return allNeighbors.filter((neighbor) => data[neighbor.row][neighbor.col] === 'S');
    }
    return [];
  };
  const nodes = grid.nodes(data, getValidNeighbors);

  // Start from each "A" cell, and move to each neighboring "S" cell.
  // We'll then check if the cell in the opposite direction of the "S" (from "A") is a "M".
  // If we have 2 of these, we have made X-MAS.
  const aLocations = parts.aLocations || [];
  aLocations.forEach((region) => {
    region.coords.values().forEach(([aRow, aCol]) => {
      let X_MAS = 0;
      const aNode = nodes.get([aRow, aCol])!;
      aNode.edges.forEach((sNode) => {
        const sOffset = grid.offset(aNode.value.gridSource, sNode.value.gridSource);
        if (sOffset.colOffset === 0 || sOffset.rowOffset === 0) {
          // Need to be diagonal, not linear.
          return;
        }
        const oppositeOffset: ReturnType<typeof grid.offset> = {
          colOffset: -sOffset.colOffset,
          rowOffset: -sOffset.rowOffset,
        };
        const oppositePoint = grid.at(aRow + oppositeOffset.rowOffset, aCol + oppositeOffset.colOffset);
        if (oppositePoint.row >= 0 && oppositePoint.row < data.length && oppositePoint.col >= 0 && oppositePoint.col < data[0].length){
          if (data[oppositePoint.row][oppositePoint.col] === 'M') {
            X_MAS += 1;
          }
        }
      });
      if (X_MAS === 2) {
        result += 1;
      }
    });
  });
  return result;
}

log.write(solve());
