
import { array, comparator, ds, fn, graph, input, log } from "@Hyperlisk/aoc-lib";

type Valve = {
  flowRate: number;
  name: string;
  tunnels: Array<string>;
};

type RunData = {
  closedValves: Set<graph.Node<Valve>>;
  currentNode: graph.Node<Valve>;
  minutesRemaining: number;
  path: Array<{
    action: 'open' | 'move';
    valve: string;
  }>;
  pressureReleased: number;
  pressureReleasedPerMinute: number;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function solveFasterButStillTooSlow(input: InputType) {
  const nodeMap = new Map<string, graph.Node<Valve>>();
  for (const node of input) {
    nodeMap.set(node.value.name, node);
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

  const remainingRuns = ds.queue.priority<RunData>((a, b) => {
    if (a.closedValves.size === 0 && b.closedValves.size > 0) {
      return 1;
    }
    if (b.closedValves.size === 0 && a.closedValves.size > 0) {
      return -1;
    }
    if (a.minutesRemaining === 0 && b.minutesRemaining > 0) {
      return 1;
    }
    if (b.minutesRemaining === 0 && a.minutesRemaining > 0) {
      return -1;
    }
    return (
      comparator.numbers.descending(a.closedValves.size, b.closedValves.size)
      || comparator.numbers.descending(
        a.pressureReleased + a.minutesRemaining * a.pressureReleasedPerMinute,
        b.pressureReleased + b.minutesRemaining * b.pressureReleasedPerMinute,
      )
    );
  });

  // Set initial position
  remainingRuns.push({
    closedValves: new Set(Array.from(nodeMap.values()).filter((valve) => valve.value.flowRate !== 0)),
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    currentNode: nodeMap.get('AA')!,
    minutesRemaining: 30,
    path: [],
    pressureReleased: 0,
    pressureReleasedPerMinute: 0,
  });

  const getPathToValve: typeof graph.dijkstra<Valve> = fn.memoize(graph.dijkstra, (a, b) => {
    return comparator.strings(a[0].value.name, b[0].value.name)
      || comparator.strings(a[1].value.name, b[1].value.name);
  });
  const visited = new Set<string>();
  const visitedKey = (run: RunData) => {
    return [
      run.currentNode.value.name,
      Array.from(run.closedValves)
        .map((closedValve) => closedValve.value.name)
        .sort()
        .join(','),
      run.pressureReleased,
      run.pressureReleasedPerMinute,
    ].join('|');
  };
  while (remainingRuns.length) {
    const currentRun = remainingRuns.pop();

    // Check if we've been here before:
    const stateKey = visitedKey(currentRun);
    if (visited.has(stateKey)) {
      continue;
    }
    visited.add(stateKey);

    if (currentRun.closedValves.size === 0 || currentRun.minutesRemaining === 0) {
      return currentRun.pressureReleased + currentRun.minutesRemaining * currentRun.pressureReleasedPerMinute;
    }

    // Move to the next closed valve.
    for (const closedValve of currentRun.closedValves) {
      // Move to and open the valve.
      const pathToValve = getPathToValve(currentRun.currentNode, closedValve);
      if (pathToValve === null) {
        throw new Error(`Can not find path from ${currentRun.currentNode.value.name} to ${closedValve.value.name}`);
      }
      // +1 because path includes the start, but we don't count that because we do not move to it.
      // -1 because we do count opening the valve.
      const minutesSpent = pathToValve.length;
      if (minutesSpent > currentRun.minutesRemaining) {
        remainingRuns.push({
          closedValves: currentRun.closedValves,
          currentNode: currentRun.currentNode,
          minutesRemaining: 0,
          path: currentRun.path,
          pressureReleased: currentRun.pressureReleased + currentRun.minutesRemaining * currentRun.pressureReleasedPerMinute,
          pressureReleasedPerMinute: currentRun.pressureReleasedPerMinute,
        });
      } else {
        const closedValves = new Set(currentRun.closedValves);
        closedValves.delete(closedValve);
        remainingRuns.push({
          closedValves: closedValves,
          currentNode: closedValve,
          minutesRemaining: currentRun.minutesRemaining - minutesSpent,
          path: array.concat(
            currentRun.path,
            array.view(pathToValve, 1).map((valve) => ({ action: 'move', valve: valve.value.name })),
            [{ action: 'open', valve: closedValve.value.name }],
          ),
          pressureReleased: currentRun.pressureReleased + minutesSpent * currentRun.pressureReleasedPerMinute,
          pressureReleasedPerMinute: currentRun.pressureReleasedPerMinute + closedValve.value.flowRate,
        });
      }
    }
    
    // My original solution that is not fast enough.
    // if (!currentRun.openValves.has(currentRun.currentNode.value.name) && currentRun.currentNode.value.flowRate !== 0) {
    //   // We will stay here, but just open the valve.
    //   const openValves = new Set(currentRun.openValves);
    //   openValves.add(currentRun.currentNode.value.name);
    //   remainingRuns.push({
    //     currentNode: currentRun.currentNode,
    //     minutesRemaining: currentRun.minutesRemaining - 1,
    //     openValves: openValves,
    //     path: currentRun.path.concat({ action: 'open', valve: currentRun.currentNode.value.name }),
    //     pressureReleased: currentRun.pressureReleased + currentRun.pressureReleasedPerMinute,
    //     pressureReleasedPerMinute: currentRun.pressureReleasedPerMinute + currentRun.currentNode.value.flowRate,
    //   });
    // }
    // // Move wherever we can:
    // for (const edge of currentRun.currentNode.edges) {
    //   // Move to the connecting valves, except if we just moved from there.
    //   if (currentRun.path.length > 1) {
    //     const justMovedHere = currentRun.path[currentRun.path.length - 1].action === 'move';
    //     const valveMovedFrom = currentRun.path[currentRun.path.length - 2].valve;
    //     if (justMovedHere && valveMovedFrom === edge.value.name) {
    //       // We just moved here from that valve.
    //       // Doubling back immediately will never be optimal, and will only waste time to get back to an old state.
    //       continue;
    //     }
    //   }
    //   const pathToValve = getPathToValve(currentRun.currentNode, edge);
    //   remainingRuns.push({
    //     currentNode: edge,
    //     minutesRemaining: currentRun.minutesRemaining - pathToValve.length + 1,
    //     openValves: currentRun.openValves,
    //     path: currentRun.path.concat({ action: 'move', valve: edge.value.name }),
    //     pressureReleased: currentRun.pressureReleased + currentRun.pressureReleasedPerMinute,
    //     pressureReleasedPerMinute: currentRun.pressureReleasedPerMinute,
    //   });
    // }
  }
}

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
        // Try direct swap
        // const pathCopy = path.slice(0);
        // [pathCopy[i], pathCopy[j]] = [pathCopy[j], pathCopy[i]];
        // const swappedPressureReleased = getPressureReleasedByPath(AA, pathCopy);
        // if (swappedPressureReleased > pressureReleased) {
        //   pressureReleased = swappedPressureReleased;
        //   [path[i], path[j]] = [path[j], path[i]];
        //   swapped = true;
        //   continue trySwapping;
        // }
        // Try 2-opt swap
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
