
import { array, graph, grid, input, log } from "@Hyperlisk/aoc-lib";

type InputType = Array<Array<string>>;

const inputData = await input.fetchProblemInput(2022, 12);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => input.parse(line, input.parse.split.character, String),
);


const heightMemo: Record<string, number> = {};

function _mapHeight(char: string): number {
  if (char === 'E') {
    return _mapHeight('z');
  }
  if (char === 'S') {
    return _mapHeight('a');
  }
  return char.charCodeAt(0) - 'a'.charCodeAt(0);
}

function mapHeight(char: string): number {
  if (!(char in heightMemo)) {
    heightMemo[char] = _mapHeight(char);
  }
  return heightMemo[char];
}

function solve(input: InputType) {
  const heightGrid: Array<Array<number>> = [];
  const possibleStarts: Array<grid.GridPoint> = [];
  let endCol = -1;
  let endRow = -1;
  let startCol = -1;
  let startRow = -1;
  for (let row = 0;row < input.length;row++) {
    heightGrid[row] = [];
    for (let col = 0;col < input[row].length;col++) {
      if (input[row][col] === 'E') {
        endCol = col;
        endRow = row;
      }
      if (input[row][col] === 'S') {
        startCol = col;
        startRow = row;
      }
      if (input[row][col] === 'a' ) {
        possibleStarts.push(grid.at(row, col));
      }
      heightGrid[row][col] = mapHeight(input[row][col]);
    }
  }
  if (endCol < 0 || endRow < 0) {
    throw new Error("Uknown end.");
  }

  const heightGraphNodeMap = grid.nodes(
    heightGrid,
    (point: grid.GridPoint) =>
      grid.neighbors.adjacent(point, { cols: heightGrid[0].length, rows: heightGrid.length })
        .filter((neighbor) => heightGrid[point.row][point.col] + 1 >= heightGrid[neighbor.row][neighbor.col]),
  );
  const startNode = heightGraphNodeMap.get([startRow, startCol]);
  const endNode = heightGraphNodeMap.get([endRow, endCol]);
  if (!startNode || !endNode) {
    throw new Error("Could not get the start or end node.");
  }

  const pathSE = graph.dijkstra(startNode, endNode);
  if (pathSE === null) {
    throw new Error("Could not find a path from S to E.");
  }
  const path = array.reduce(
    possibleStarts,
    (shortestPath, start) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const startNode = heightGraphNodeMap.get([start.row, start.col])!;
      const path = graph.dijkstra(startNode, endNode);
      if (path === null) {
        return shortestPath;
      }
      return path.length < shortestPath.length ? path : shortestPath;
    },
    pathSE,
  );
  // Subtract 1 because we do not count starting at (0, 0) as a step.
  return path.length - 1;
}

log.write(solve(parsedInput));
