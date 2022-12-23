
import { array, comparator, input, log } from "@Hyperlisk/aoc-lib";

type Monkey = {
  items: Array<number>;
  operation: (worryLevel: number) => number;
  test: (worryLevel: number) => number;
};
type InputType = Array<Monkey>;

const inputData = await input.fetchProblemInput(2022, 11);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.group,
  (monkey) => {
    const lines = input.parse(monkey, input.parse.split.line, String);
    if (lines.length !== 6) {
      throw new Error(`I only know how to handle 6 lines, but I got: ${lines.length}`);
    }
    const [
      /* monkeyId */,
      startingItemsLine,
      operationLine,
      testLine,
      // Inspected my own input, which has the guarantee of the true/false order here.
      trueLine,
      falseLine,
    ] = lines;

    const items = input.parse(startingItemsLine.split(': ')[1], ', ', Number);
    const operationParts = input.parse(operationLine.split(': new = ')[1], ' ', String);
    const operation: (worryLevel: number) => number = (worryLevel) => {
      const mapValue = (value: string) => {
        return (value === 'old') ? worryLevel : parseInt(value, 10);
      };
      const initialValue = mapValue(operationParts[0]);
      return array.reduce(
        operationParts.slice(1),
        (worryLevel, operationPart, slicedOperationPartIdx) => {
          if (operationPart === '*' || operationPart === '+') {
            // We'll inspect the operator in the next iteration.
            return worryLevel;
          }
          const operator = operationParts[slicedOperationPartIdx];
          const value = mapValue(operationPart);
          if (operator === '*') {
            return worryLevel * value;
          } else if (operator === '+') {
            return worryLevel + value;
          }
          throw new Error(`No idea how to handle operator: ${operator}`);
        },
        initialValue,
      );
    };
    const testParts = input.parse(testLine.split(': ')[1], input.parse.split.space, String);
    if (testParts[0] !== 'divisible' && testParts[1] !== 'by') {
      throw new Error(`No idea how to handle test: ${testLine}`);
    }
    const divisor = parseInt(testParts[2], 10);
    const trueParts = input.parse(trueLine.split(': ')[1], input.parse.split.space, String);
    if (trueParts[0] !== 'throw' && trueParts[1] !== 'to' && trueParts[2] !== 'monkey') {
      throw new Error(`No idea how to handle true: ${trueLine}`);
    }
    const trueResult = parseInt(trueParts[3], 10);
    const falseParts = input.parse(falseLine.split(': ')[1], input.parse.split.space, String);
    if (falseParts[0] !== 'throw' && falseParts[1] !== 'to' && falseParts[2] !== 'monkey') {
      throw new Error(`No idea how to handle false: ${falseLine}`);
    }
    const falseResult = parseInt(falseParts[3], 10);
    const test = (worryLevel: number) => {
      if (worryLevel % divisor === 0) {
        return trueResult;
      } else {
        return falseResult;
      }
    };

    return {
      items: items,
      operation: operation,
      test: test,
    };
  },
);

function solve(input: InputType) {
  const monkeyInspections: Record<string, number> = {};

  function runRound() {
    input.forEach((monkey, monkeyIdx) => {
      monkey.items.forEach((item) => {
        const worryDuringInspection = monkey.operation(item);
        const worryAfterInspection = Math.floor(worryDuringInspection / 3);
        const monkeyToThrowTo = monkey.test(worryAfterInspection);
        input[monkeyToThrowTo].items.push(worryAfterInspection);
        monkeyInspections[monkeyIdx] = (monkeyInspections[monkeyIdx] || 0) + 1;
      });
      monkey.items = [];
    });
  }

  array.range(0, 20).forEach(runRound);

  const sortedMonkeyInspections = array.sorted(Object.values(monkeyInspections), comparator.numbers.descending);
  // Sorted in descending order, so greatest values are first.
  return sortedMonkeyInspections[0] * sortedMonkeyInspections[1];
}

log.write(solve(parsedInput));
