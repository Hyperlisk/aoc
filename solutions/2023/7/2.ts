

import { comparator, ds, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 7);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (line) =>
    input
      .parse(line, input.parse.split.space, String)
);

const CARDS = ds.Enum('J23456789TQKA');

function solve(games: [string, string, number][]) {
  games.forEach((game) => {
    const counts: Record<string, number> = Object.create(null);
    const [cards] = game;
    let maxCount = 0;
    [].forEach.call(cards, (c) => {
      counts[c] = (counts[c] | 0) + 1;
      if (counts[c] > maxCount && c !== 'J') {
        maxCount = counts[c];
      }
    });
    // Set strength
    let keyCount = Object.keys(counts).length;
    if ('J' in counts) {
      maxCount += counts.J;
      keyCount -= 1;
    }
    if (maxCount === 5) {
      game[2] = 6;
    } else if (maxCount === 4) {
      game[2] = 5;
    } else if (maxCount === 3 && keyCount === 2) {
      game[2] = 4;
    } else if (maxCount === 3) {
      game[2] = 3;
    } else if (maxCount === 2 && keyCount === 3) {
      game[2] = 2;
    } else if (maxCount === 2 && keyCount === 4) {
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
