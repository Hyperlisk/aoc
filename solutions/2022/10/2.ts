
import { input, log } from "@Hyperlisk/aoc-lib";

type InputType = Array<{ opcode: string, argument?: number }>;

const inputData = await input.fetchProblemInput(2022, 10);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => {
    const parts = line.split(' ');
    return {
      opcode: parts[0],
      argument: parts.length > 1 ? parseInt(parts[1], 10) : undefined,
    };
  },
);

function solve(input: InputType) {
  let totalSignalStrength = 0;

  function getSignalStrength(cycleNumber: number, x: number) {
    return cycleNumber * x;
  }

  const cyclesWeCareAbout = new Set([20, 60, 100, 140, 180, 220]);

  let cycleNumber = 0;
  let x = 1;
  function tick() {
    cycleNumber += 1;
    if (cyclesWeCareAbout.has(cycleNumber)) {
      totalSignalStrength += getSignalStrength(cycleNumber, x);
    }
  }
  input.forEach((command) => {
    if (command.opcode === 'noop') {
      tick();
    } else if (command.opcode === 'addx') {
      tick();
      tick();
      x += command.argument || 0;
    }
  });

  return totalSignalStrength;
}

log.write(solve(parsedInput));
