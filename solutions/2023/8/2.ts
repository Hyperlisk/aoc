

import { array, input, log, math } from "@Hyperlisk/aoc-lib";

type NodeDef = {
  id: string;
  L: string;
  R: string;
};

const inputData = await input.fetchProblemInput(2023, 8);
const DATA = input.parse(
  inputData,
  input.parse.split.line,
  (line) => {
    const [name, , L, R] = input.parse(line, input.parse.split.space, String);
    return {
      id: name,
      L: L ? L.substring(1, L.length - 1) : '',
      R: R ? R.substring(0, R.length - 1) : '',
    };
  }
);


function solve(data: typeof DATA) {
  const directions = data[0].id;
  const nodeMap: Record<string, NodeDef> = {};
  array.view(data, 1).forEach((nodeDef) => {
    nodeMap[nodeDef.id] = nodeDef;
  });
  const startingNodes: NodeDef[] = [];
  for(const [id, node] of Object.entries(nodeMap)) {
    if (id.charAt(id.length - 1) === 'A') {
      startingNodes.push(node);
    }
  }
  
  const findFrom = (id: string, step: number): [id: string, step: number] => {
    while (id.charAt(id.length - 1) !== 'Z') {
      if (directions[step % directions.length] === 'L') {
        id = nodeMap[id].L;
      }
      if (directions[step % directions.length] === 'R') {
        id = nodeMap[id].R;
      }
      step += 1;
    }
    return [id, step];
  };
  
  const steps = startingNodes.map((node) => findFrom(node.id, 0));

  return steps.map(([, step]) => step).reduce((a, n) => math.lcm(a, n), 1);
}

const solution = solve(DATA);
log.write(solution);
