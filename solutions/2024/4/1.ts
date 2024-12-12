
import { comparator, grid, input, log } from "@Hyperlisk/aoc-lib";

type InputType = string[][];

const inputData = await input.fetchProblemInput(2024, 4);
const data: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line: string) => input.parse(line, input.parse.split.character, (c) => c),
);

function solve() {
  let result = 0;

  // Find location of "X" cells.
  const parts = grid.identify(
    data,
    {
      xLocations: "X",
    },
  );

  // Map nodes in a directed way, making X -> M -> A -> S nodes.
  const getValidNeighbors = (point: grid.GridPoint): grid.GridPoint[] => {
    const allNeighbors = grid.neighbors.all(point, { cols: data[0].length, rows: data.length });
    const c = data[point.row][point.col];
    if (c === 'X') {
      return allNeighbors.filter((neighbor) => data[neighbor.row][neighbor.col] === 'M');
    }
    if (c === 'M') {
      return allNeighbors.filter((neighbor) => data[neighbor.row][neighbor.col] === 'A');
    }
    if (c === 'A') {
      return allNeighbors.filter((neighbor) => data[neighbor.row][neighbor.col] === 'S');
    }
    return [];
  };
  const nodes = grid.nodes(data, getValidNeighbors);

  // Start from each "X" cell, and move to each neighboring "M" cell.
  // Continue with "A" and "S" cells, verifying they are follow the direction set from X -> M.
  const xLocations = parts.xLocations || [];
  xLocations.forEach((region) => {
    region.coords.values().forEach(([xRow, xCol]) => {
      const xNode = nodes.get([xRow, xCol])!;
      xNode.edges.forEach((mNode) => {
        const mOffset = grid.offset(xNode.value.gridSource, mNode.value.gridSource);
        mNode.edges.forEach((aNode) => {
          const aOffset = grid.offset(mNode.value.gridSource, aNode.value.gridSource);
          if (comparator.generic([mOffset.rowOffset, mOffset.colOffset], [aOffset.rowOffset, aOffset.colOffset]) !== 0) {
            return;
          }
          aNode.edges.forEach((sNode) => {
            const sOffset = grid.offset(aNode.value.gridSource, sNode.value.gridSource);
            if (comparator.generic([aOffset.rowOffset, aOffset.colOffset], [sOffset.rowOffset, sOffset.colOffset]) !== 0) {
              return;
            }
            result += 1;
          });
        });
      });
    });
  });
  return result;
}

log.write(solve());
