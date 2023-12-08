

import { array, input, log } from "@Hyperlisk/aoc-lib";

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
    const [id, , L, R] = input.parse(line, input.parse.split.space, String);
    return {
      id: id,
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

  let current = 'AAA';
  let step = 0;
  while (current !== 'ZZZ') {
    if (directions[step % directions.length] === 'L') {
      current = nodeMap[current].L;
    }
    if (directions[step % directions.length] === 'R') {
      current = nodeMap[current].R;
    }
    step += 1;
  }

  return step;
}

const solution = solve(DATA);
log.write(solution);
