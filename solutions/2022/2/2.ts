
import { array, input, log } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2022, 2);
const data = input.parse(
  inputData,
  input.parse.split.line,
  (dataLine: string) =>
    input.parse(dataLine, input.parse.split.space, String),
);

const THROWS = {
  ROCK: 'rock',
  PAPER: 'paper',
  SCISSORS: 'scissors',
};
const THROW_MAP: Record<string, string> = {
  'A': THROWS.ROCK,
  'B': THROWS.PAPER,
  'C': THROWS.SCISSORS,
};
const THROW_VALUES = {
  [THROWS.ROCK]: 1,
  [THROWS.PAPER]: 2,
  [THROWS.SCISSORS]: 3,
};

const RESULT_VALUES = {
  loss: 0,
  draw: 3,
  win: 6,
};
const RESULT_MAP: Record<string, number> = {
  'X': RESULT_VALUES.loss,
  'Y': RESULT_VALUES.draw,
  'Z': RESULT_VALUES.win,
};

const gameResult = (opponent: string, requiredOutcome: string) => {
  const loss = RESULT_MAP[requiredOutcome] === RESULT_VALUES.loss;
  if (loss) {
    const myThrow = THROW_MAP[opponent] === THROWS.ROCK
                ? THROWS.SCISSORS
                : THROW_MAP[opponent] === THROWS.PAPER
                  ? THROWS.ROCK
                  : THROWS.PAPER;
    return THROW_VALUES[myThrow] + RESULT_VALUES.loss;
  }
  const draw = RESULT_MAP[requiredOutcome] === RESULT_VALUES.draw
  if (draw) {
    const myThrow = THROW_MAP[opponent] === THROWS.ROCK
                ? THROWS.ROCK
                : THROW_MAP[opponent] === THROWS.PAPER
                  ? THROWS.PAPER
                  : THROWS.SCISSORS;
    return THROW_VALUES[myThrow] + RESULT_VALUES.draw;
  }
  const win = RESULT_MAP[requiredOutcome] === RESULT_VALUES.win;
  if (win) {
    const myThrow = THROW_MAP[opponent] === THROWS.ROCK
                ? THROWS.PAPER
                : THROW_MAP[opponent] === THROWS.PAPER
                  ? THROWS.SCISSORS
                  : THROWS.ROCK;
    return THROW_VALUES[myThrow] + RESULT_VALUES.win;
  }
  throw new Error(`Unkown values: [opponent:${opponent}] [requiredOutcome:${requiredOutcome}]`);
}

function solve(fixedGames: Array<Array<string>>) {
  const gameResults = fixedGames.map((fixedGame, i) => {
    const [opponentThrow, myThrow] = fixedGame;
    return gameResult(opponentThrow, myThrow);
  });
  return array.sum(gameResults);
}

const solution = solve(data);
log.write(solution);
