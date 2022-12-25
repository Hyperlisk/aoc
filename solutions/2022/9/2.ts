
import { array, grid, input, log, point } from "@Hyperlisk/aoc-lib";

type InputType = Array<{ direction: string, amount: number }>;

const inputData = await input.fetchProblemInput(2022, 9);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => {
    const parts = line.split(' ');
    return {
      direction: parts[0],
      amount: parseInt(parts[1], 10),
    };
  },
);

function solve(input: InputType) {
  // Make a 1D array of all the directions to take in-order.
  const expandedDirections = array.concat(
    ...input.map(({ amount, direction }) => array.fill(direction, amount)),
  );

  const nextDirection = array.stepper(expandedDirections);

  const navigateHead = grid.navigator(
    grid.at(0, 0),
    (current) => {
      const direction = nextDirection();
      if (direction === 'D') {
        return grid.navigator.step.down(current);
      } else if (direction === 'L') {
        return grid.navigator.step.left(current);
      } else if (direction === 'R') {
        return grid.navigator.step.right(current);
      } else if (direction === 'U') {
        return grid.navigator.step.up(current);
      }
      throw new Error(`Not sure how to go ${direction} from ${JSON.stringify(current)}`);
    },
  );

  const createFollower = (head: ReturnType<typeof grid.navigator>) => grid.navigator(
    grid.at(0, 0),
    (current) => {
      if (!current) {
        throw new Error("No tail?");
      }
      const { col, row } = current;

      const headLocation = head.current();
      if (!headLocation) {
        throw new Error("No head?");
      }
      const { col: headCol, row: headRow } = headLocation;

      const headDist = Math.abs(col - headCol) + Math.abs(row - headRow);

      if (row === headRow) {
        const diff = col - headCol;
        if (diff === 2) {
          // Tail has a larger column number than the head by 2, move left 1
          return grid.navigator.step.left(current);
        }
        if (diff === -2) {
          // Tail has a smaller column number than the head by 2, move right 1
          return grid.navigator.step.right(current);
        }
      }

      if (col === headCol) {
        const diff = row - headRow;
        if (diff === 2) {
          // Tail has a larger row number than the head by 2, move up 1
          return grid.navigator.step.up(current);
        }
        if (diff === -2) {
          // Tail has a smaller row number than the head by 2, move down 1
          return grid.navigator.step.down(current);
        }
      }

      if (headDist > 2) {
        // We know the tail is not in the same row or column, so we don't need <=, or >=
        // on any of these comparisons.
        if (headRow < row && headCol < col) {
          // Head is up-left somewhere
          return grid.navigator.step.up(grid.navigator.step.left(current));
        }
        if (headRow < row && headCol > col) {
          // Head is up-right somewhere
          return grid.navigator.step.up(grid.navigator.step.right(current));
        }
        if (headRow > row && headCol < col) {
          // Head is down-left somewhere
          return grid.navigator.step.down(grid.navigator.step.left(current));
        }
        if (headRow > row && headCol > col) {
          // Head is down-right somewhere
          return grid.navigator.step.down(grid.navigator.step.right(current));
        }
      }

      // Just stay where we are, I guess.
      return current;
    },
  );

  const follower1 = createFollower(navigateHead);
  const follower2 = createFollower(follower1);
  const follower3 = createFollower(follower2);
  const follower4 = createFollower(follower3);
  const follower5 = createFollower(follower4);
  const follower6 = createFollower(follower5);
  const follower7 = createFollower(follower6);
  const follower8 = createFollower(follower7);
  const follower9 = createFollower(follower8);

  // The first items would be the origin.
  // We have those as (0, 0) for both, so we can handle that separately.
  navigateHead();
  follower1();
  follower2();
  follower3();
  follower4();
  follower5();
  follower6();
  follower7();
  follower8();
  follower9();

  const tailPointSet = new point.set();
  const tailCurrent = follower9.current();
  if (tailCurrent) {
    tailPointSet.add(tailCurrent);
  }

  expandedDirections.forEach(() => {
    navigateHead();
    follower1();
    follower2();
    follower3();
    follower4();
    follower5();
    follower6();
    follower7();
    follower8();
    follower9();

    const tailCurrent = follower9.current();
    if (tailCurrent) {
      tailPointSet.add(tailCurrent);
    }
  });

  return tailPointSet.size;
}

log.write(solve(parsedInput));

