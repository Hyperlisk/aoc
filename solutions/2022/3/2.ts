
import { array, input, log } from "@Hyperlisk/aoc-lib";

// We need to use this type because trying to `.map` over a tuple type converts it into an array type.
// This also makes us to use the wonky return from the later `.map`.
type SplitChunks = [string[], string[], string[]];

const inputData = await input.fetchProblemInput(2022, 3);
const data =
  array.chunk(input.parse(inputData, input.parse.split.line, String), 3)
    .map<SplitChunks>(chunk => [
      input.parse(chunk[0], input.parse.split.character, String),
      input.parse(chunk[1], input.parse.split.character, String),
      input.parse(chunk[2], input.parse.split.character, String),
    ]);

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

function solve(rucksacks: Array<SplitChunks>) {
  // Use `flatMap` to end up with a flat array with all of the errors.
  const rucksackBadges = rucksacks.flatMap(chunk => array.intersection(...chunk));
  const rucksackBadgePriorities = rucksackBadges.map(findPriority);
  return array.sum(rucksackBadgePriorities);
}

const solution = solve(data);
log.write(solution);
