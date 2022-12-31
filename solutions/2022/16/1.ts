
import { array, comparator, fn, graph, input, log } from "@Hyperlisk/aoc-lib";

type Valve = {
  flowRate: number;
  name: string;
  tunnels: Array<string>;
};

type InputType = Array<graph.Node<Valve>>;

const inputData = await input.fetchProblemInput(2022, 16);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => {
    const match = line.match(/Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? ([\w, ]+)/);
    if (match === null) {
      throw new Error(`Did not match: ${line}`);
    }
    return graph.node({
      flowRate: parseInt(match[2], 10),
      name: match[1],
      tunnels: input.parse(match[3], ', ', String),
    });
  },
);

function solve(input: InputType) {
  // Create a path through all valves that will increase flow rate.
  const path: Array<graph.Node<Valve>> = [];
  const nodeMap = new Map<string, graph.Node<Valve>>();
  for (const node of input) {
    nodeMap.set(node.value.name, node);
    if (node.value.flowRate !== 0) {
      // This coincidentally also keeps `AA` out of our initial path.
      path.push(node);
    }
  }
  for (const node of input) {
    node.value.tunnels.forEach((neighbor) => {
      const neighborNode = nodeMap.get(neighbor);
      if (!neighborNode) {
        throw new Error(`Could not find neighbor node: ${neighbor}`);
      }
      node.edges.push(neighborNode);
    });
  }

  function compareNodeNames(a: graph.Node<Valve>, b: graph.Node<Valve>) {
    return comparator.strings(a.value.name, b.value.name);
  }

  const getPathToValve: typeof graph.dijkstra<Valve> = fn.memoize(
    graph.dijkstra,
    (a, b) => {
      return compareNodeNames(a[0], b[0]) || compareNodeNames(a[1], b[1]);
    },
  );

  function _getPressureReleasedByPath(initialNode: graph.Node<Valve>, path: Array<graph.Node<Valve>>) {
    let currentNode = initialNode;
    let minutesRemaining = 30;
    let pressureReleased = 0;
    let pressureReleasedPerMinute = 0;
    // Move to the next closed valve.
    for (const closedValve of path) {
      // Move to and open the valve.
      const pathToValve = getPathToValve(currentNode, closedValve);
      if (pathToValve === null) {
        throw new Error(`Can not find path from ${currentNode.value.name} to ${closedValve.value.name}`);
      }
      // +1 because path includes the start, but we don't count that because we do not move to it.
      // -1 because we do count opening the valve.
      const minutesSpent = pathToValve.length;
      if (minutesSpent > minutesRemaining) {
        return pressureReleased + minutesRemaining * pressureReleasedPerMinute;
      } else {
        currentNode = closedValve;
        minutesRemaining = minutesRemaining - minutesSpent;
        pressureReleased = pressureReleased + minutesSpent * pressureReleasedPerMinute;
        pressureReleasedPerMinute = pressureReleasedPerMinute + closedValve.value.flowRate;
      }
    }
    return pressureReleased + minutesRemaining * pressureReleasedPerMinute;
  }
  const getPressureReleasedByPath: typeof _getPressureReleasedByPath = fn.memoize(
    _getPressureReleasedByPath,
    ([,pathA], [,pathB]) => {
      for (let i = 0;i < pathA.length;i++) {
        const cmp = compareNodeNames(pathA[i], pathB[i]);
        if (cmp) {
          return cmp;
        }
      }
      return 0;
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const AA = nodeMap.get('AA')!;
  let pressureReleased = getPressureReleasedByPath(AA, path);
  let swapped = true;
  // JavaScript has labels for break and continue.
  trySwapping:
  while (swapped) {
    swapped = false;
    // Try swapping the order of valve to see if we can refine this path to a better one.
    for (let i = 0;i < path.length;i++) {
      for (let j = i + 1;j <= path.length;j++) {
        // 2-opt swap
        const pathCopy = array.concat(
          path.slice(0, i),
          array.reverse(path.slice(i, j)),
          path.slice(j),
        );
        const swappedPressureReleased = getPressureReleasedByPath(AA, pathCopy);
        if (swappedPressureReleased > pressureReleased) {
          pressureReleased = swappedPressureReleased;
          for (let ii = 0;ii < j;ii++) {
            path[ii] = pathCopy[ii];
          }
          swapped = true;
          continue trySwapping;
        }
      }
    }
    break;
  }
  return pressureReleased;
}

log.write(solve(parsedInput));
