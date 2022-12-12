
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
  const OUTPUT_COLUMNS = 40;

  let cycleNumber = 0;
  let x = 1;
  const output : Array<Array<'.' | '#'>> = [];
  function tick() {
    const outputColumn = cycleNumber % OUTPUT_COLUMNS;
    if (outputColumn === 0) {
      output.push([]);
    }
    const outputRow = output[output.length - 1];
    cycleNumber += 1;
    outputRow.push((outputColumn === x - 1 || outputColumn === x || outputColumn === x + 1) ? '#' : '.');
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

  return output.map((outputRow) => outputRow.join('')).join("\n");
}

log.write(solve(parsedInput));
