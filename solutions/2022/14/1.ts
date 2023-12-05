
import { array, grid, input, log, point } from "@Hyperlisk/aoc-lib";

type InputType = Array<Array<point.Point>>;

const inputData = await input.fetchProblemInput(2022, 14);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => line.split(' -> ').map((xy) => {
    const [x, y] = xy.split(',').map((coordinate) => parseInt(coordinate, 10));
    return point.at(x, y);
  }),
);

function solve(input: InputType) {
  function makeStepTowards(dest: point.Point) {
    return function stepTowards(current: grid.GridPoint) {
      const cmp = point.compare(current, dest);
      if (cmp.x === -1) {
        return grid.navigator.step.right(current);
      }
      if (cmp.x === 1) {
        return grid.navigator.step.left(current);
      }
      if (cmp.y === -1) {
        return grid.navigator.step.down(current);
      }
      if (cmp.y === 1) {
        return grid.navigator.step.up(current);
      }
      return undefined;
    };
  }

  const settled = new point.set();
  const settledBoundingBox = grid.box(grid.at(0, 500));
  input.forEach((points) => {
    let current = grid.at.point(points[0]);
    array.view(points, 1)
      .forEach((waypoint) => {
        grid.navigator(current, makeStepTowards(waypoint))
          .while(
            true,
            (current) => {
              settled.add(current);
              settledBoundingBox.include(current);
              return undefined;
            },
          );
        current = grid.at.point(waypoint);
      });
  });
  
  const canStep = (current?: grid.GridPoint) => {
    if (!current) {
      return false;
    }
    const below = grid.navigator.step.down(current);
    const belowLeft = grid.navigator.step.left(below);
    const belowRight = grid.navigator.step.right(below);
    return !settled.has(below) || !settled.has(belowLeft) || !settled.has(belowRight);
  };

  const moveSand = grid.navigator(
    grid.at(0, 500),
    (current) => {
      const below = grid.navigator.step.down(current);
      if (!settled.has(below)) {
        return below;
      }
      const belowLeft = grid.navigator.step.left(below);
      if (!settled.has(belowLeft)) {
        return belowLeft;
      }
      const belowRight = grid.navigator.step.right(below);
      if (!settled.has(belowRight)) {
        return belowRight;
      }
      return undefined;
    }
  );

  const settledBeforeSand = settled.size;
  let sandInBox = true;
  do {
    moveSand.while((next) => settledBoundingBox.has(next));
    const fallingSand = moveSand.back();
    if (fallingSand) {
      // Sand will continue falling.
      sandInBox = false;
    } else {
      // The sand settled, so we stopped moving (return "undefined")
      // Back up to where the sand settled.
      const settledSand = moveSand.back();
      if (!settledSand) {
        throw new Error("Sand was not settled?");
      }
      settled.add(settledSand);
      settledBoundingBox.include(settledSand);

      // Back up to before the sand settled.
      while (moveSand.current() !== undefined && !canStep(moveSand.current())) {
        moveSand.back();
      }
    }
  } while (sandInBox);

  return settled.size - settledBeforeSand;
}

log.write(solve(parsedInput));
