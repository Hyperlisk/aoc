
import { grid, input, log, point } from "@Hyperlisk/aoc-lib";

type InputType = Array<{
  beacon: point.Point;
  sensor: point.Point;
}>;

const inputData = await input.fetchProblemInput(2022, 15);
const parsedInput: InputType = input.parse(
  inputData,
  input.parse.split.line,
  (line) => {
    const points = Array.from(line.matchAll(/x=(-?\d+), y=(-?\d+)/g));
    return {
      beacon: point.at(parseInt(points[1][1], 10), parseInt(points[1][2], 10)),
      sensor: point.at(parseInt(points[0][1], 10), parseInt(points[0][2], 10)),
    };
  },
);

function solve(input: InputType) {
  const beaconSet = new point.set();
  for (const line of input) {
    beaconSet.add(line.beacon);
  }

  const maxCoordinateValue = 4000000;
  const minCoordinateValue = 0;

  const makeDiamondWalker = (origin: point.Point, radius: number) => {
    const start = grid.at(origin.x - radius, origin.y);
    let offsetX = 1;
    let offsetY = 1;
    return {
      navigator: grid.navigator(
        start,
        (current) => {
          const result = grid.at(current.col + offsetX, current.row + offsetY);
          if (result.col === origin.x) {
            offsetY *= -1;
          }
          if (result.row === origin.y) {
            offsetX *= -1;
          }
          return result;
        },
      ),
      start: start,
    };
  };

  for (const line of input) {
    const distancePastBeacon = point.distance.total(line.sensor, line.beacon) + 1;
    // The hidden beacon must be just outside our range.
    const { navigator: stepAroundSensor, start: diamondWalkerStart } = makeDiamondWalker(line.sensor, distancePastBeacon);
    const gridPointIsStart = (other: grid.GridPoint) => {
      const startCmp = point.compare(other, diamondWalkerStart);
      return startCmp.x === 0 && startCmp.y === 0;
    };
    stepAroundSensor.while(
      (next, path) => {
        return !gridPointIsStart(next) || path.length === 1;
      },
      (current) => {
        if (current.col < minCoordinateValue || current.col > maxCoordinateValue) {
          return undefined;
        }
        if (current.row < minCoordinateValue || current.row > maxCoordinateValue) {
          return undefined;
        }
        for (const other of input) {
          if (other === line) {
            continue;
          }
          const distanceToBeacon = point.distance.total(other.sensor, other.beacon);
          const distanceToCurrent = point.distance.total(other.sensor, current);
          if (distanceToCurrent <= distanceToBeacon) {
            return undefined;
          }
        }
        return true;
      },
    );

    const last = stepAroundSensor.current();
    if (last && !gridPointIsStart(last)) {
      return point.x(last) * 4000000 + point.y(last);
    }
  }

  throw new Error("Could not find the distress signal");
}

log.write(solve(parsedInput));
