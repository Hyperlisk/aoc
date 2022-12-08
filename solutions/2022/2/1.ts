
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
  'X': THROWS.ROCK,
  'Y': THROWS.PAPER,
  'Z': THROWS.SCISSORS,
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

const gameResult = (opponent: string, me: string) => {
  const loss = (THROW_MAP[opponent] === THROWS.ROCK && THROW_MAP[me] === THROWS.SCISSORS) ||
               (THROW_MAP[opponent] === THROWS.PAPER && THROW_MAP[me] === THROWS.ROCK) ||
               (THROW_MAP[opponent] === THROWS.SCISSORS && THROW_MAP[me] === THROWS.PAPER);
  if (loss) {
    return THROW_VALUES[THROW_MAP[me]] + RESULT_VALUES.loss;
  }
  const draw = (THROW_MAP[opponent] === THROWS.ROCK && THROW_MAP[me] === THROWS.ROCK) ||
               (THROW_MAP[opponent] === THROWS.PAPER && THROW_MAP[me] === THROWS.PAPER) ||
               (THROW_MAP[opponent] === THROWS.SCISSORS && THROW_MAP[me] === THROWS.SCISSORS);
  if (draw) {
    return THROW_VALUES[THROW_MAP[me]] + RESULT_VALUES.draw;
  }
  const win = (THROW_MAP[opponent] === THROWS.ROCK && THROW_MAP[me] === THROWS.PAPER) ||
              (THROW_MAP[opponent] === THROWS.PAPER && THROW_MAP[me] === THROWS.SCISSORS) ||
              (THROW_MAP[opponent] === THROWS.SCISSORS && THROW_MAP[me] === THROWS.ROCK);
  if (win) {
    return THROW_VALUES[THROW_MAP[me]] + RESULT_VALUES.win;
  }
  throw new Error(`Unkown values: [opponent:${opponent}] [me:${me}]`);
};

function solve(fixedGames: Array<Array<string>>) {
  const gameResults = fixedGames.map((fixedGame) => {
    const [opponentThrow, myThrow] = fixedGame;
    return gameResult(opponentThrow, myThrow);
  });
  return array.sum(gameResults);
}

const solution = solve(data);
log.write(solution);
