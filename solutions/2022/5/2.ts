
import { array, input, log, string } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2022, 5);

type Stack = Array<string>;
type Instruction = [/* amount */ number, /* from */ number, /* to */ number];

const [stackData, instructionData] = input.parse(inputData, input.parse.split.group, String);
const stacks: Array<Stack> =
array.realize(
  array.zip(
    ...input.parse(
      stackData,
      input.parse.split.line,
      (stackLine) => string.chunk(stackLine, 3, { gap: 1 }),
    ),
  )
)
  .map(
    (stack) => array.realize((idx) => stack[idx].replace(/[^A-Z]/g, ''), stack.length).filter(Boolean)
  );
const instructions: Array<Instruction> = input.parse(
  instructionData,
  input.parse.split.line,
  (inputLine) => {
    const parsedLine = input.parse(inputLine, input.parse.split.space, Number);
    if (parsedLine.length !== 6) {
      throw new Error(`Unexpected line: ${inputLine}`);
    }
    const instruction: Instruction = [parsedLine[1], parsedLine[3], parsedLine[5]];
    return instruction;
  },
);

function executeInstruction(stacks: Array<Stack>, amount: number, from: number, to: number) {
  // We execute the instructions on the stacks in-place.
  // Skip bounds checking because I don't want to write it and AoC does not require it in my experience.
  // The items we need to take are in the front of the array representing a stack.
  // Copy the first `amount` items from the `from` stack over to the front of the `to` stack.
  // No need to reverse, since the moves happen at the same time.
  const indices = array.range(0, amount);
  stacks[to].unshift(...indices.map((idx) => stacks[from][idx]));
  // Remove those items from the `from` stack.
  stacks[from] = stacks[from].slice(amount);
}

function solve(stacks: Array<Stack>, instructions: Array<Instruction>) {
  instructions.forEach((instruction) => {
    // Our array is zero-indexed, but the input stack numbers are one-based, so subtract one when using it to index.
    executeInstruction(stacks, instruction[0], instruction[1] - 1, instruction[2] - 1);
  });
  // The top of the stack is at the front of the array representing the stack.
  return array.realize(stacks)
    .filter((stack) => stack.length > 0)
    .map((stack) => stack[0])
    .join('');
}

const solution = solve(stacks, instructions);
log.write(solution);
