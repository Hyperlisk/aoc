

import { array, comparator, ds, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 7);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) =>
    input
      .parse(line, input.parse.split.space, String)
);

const CARDS = ds.Enum.fromString('23456789TJQKA');

function solve(games: [string, string, number][]) {
  games.forEach((game) => {
    const cards = game[0].split('');
    const counts = array.count(cards);
    // Set strength
    if (counts.max.count === 5) {
      game[2] = 6;
    } else if (counts.max.count === 4) {
      game[2] = 5;
    } else if (counts.max.count === 3 && counts.byItem.size === 2) {
      game[2] = 4;
    } else if (counts.max.count === 3) {
      game[2] = 3;
    } else if (counts.max.count === 2 && counts.byItem.size === 3) {
      game[2] = 2;
    } else if (counts.max.count === 2 && counts.byItem.size === 4) {
      game[2] = 1;
    } else {
      game[2] = 0;
    }
  });
  games = games.sort(([handA, bidA, strengthA], [handB, bidB, strengthB]) => {
    const strengthCmp = comparator.numbers(strengthA, strengthB);
    if (strengthCmp) {
      return strengthCmp;
    }
    for (let i = 0;i < handA.length;i++) {
      const cardCmp = comparator.numbers(CARDS.value(handA[i]), CARDS.value(handB[i]));
      if (cardCmp) {
        return cardCmp;
      }
    }
    throw new Error(`Can not compare ${handA} and ${handB}`);
  });
  return games.reduce((a, [hand, bid, strength], idx) => a + Number(bid) * (idx + 1), 0);
}

const solution = solve(data as [string, string, number][]);
log.write(solution);
