
import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2022, 3);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (dataLine: string) =>
    input.parse(dataLine, input.parse.split.character, String),
);

function findRucksackErrors(rucksack: Array<string>): Array<string> {
  const leftCompartment = rucksack.slice(0, rucksack.length / 2);
  const rightCompartment = rucksack.slice(rucksack.length / 2);
  const r = array.intersection(leftCompartment, rightCompartment);
  return r;
}

const CODE_LOWER_A = 'a'.charCodeAt(0);
const CODE_LOWER_Z = 'z'.charCodeAt(0);
const CODE_UPPER_A = 'A'.charCodeAt(0);
const CODE_UPPER_Z = 'Z'.charCodeAt(0);
function findPriority(itemType: string) {
  const itemTypeCode = itemType.charCodeAt(0);
  if (itemTypeCode >= CODE_LOWER_A && itemTypeCode <= CODE_LOWER_Z) {
    return itemTypeCode - CODE_LOWER_A + 1;
  }
  if (itemTypeCode >= CODE_UPPER_A && itemTypeCode <= CODE_UPPER_Z) {
    return itemTypeCode - CODE_UPPER_A + 27;
  }
  throw new Error(`Unknown item type: ${itemType[0]}`);
}

function solve(rucksacks: Array<Array<string>>) {
  // Use `flatMap` to end up with a flat array with all of the errors.
  const rucksackErrors = rucksacks.flatMap(findRucksackErrors);
  const rucksackErrorPriorities = rucksackErrors.map(findPriority);
  return array.sum(rucksackErrorPriorities);
}

const solution = solve(data);
log.write(solution);
