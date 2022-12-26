
import { array, input, log, point } from "@Hyperlisk/aoc-lib";

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
  const sensorSet = new point.set();
  for (const line of input) {
    beaconSet.add(line.beacon);
    sensorSet.add(line.sensor);
  }
  const inspectedRow = 2000000;
  const notBeacons = new point.set();
  for (const line of input) {
    const distanceToBeacon = point.distance.total(line.sensor, line.beacon);
    const pointOnInspectedRow = point.at(line.sensor.x, inspectedRow);
    const distanceToInspectedRow = point.distance.total(line.sensor, pointOnInspectedRow);
    if (distanceToInspectedRow <= distanceToBeacon) {
      if (!beaconSet.has(pointOnInspectedRow)) {
        notBeacons.add(pointOnInspectedRow);
      }
      array.range.inclusive(1, distanceToBeacon - distanceToInspectedRow)
        .forEach((offset) => {
          const leftFromPointOnInspectedRow = point.at(pointOnInspectedRow.x - offset, inspectedRow);
          if (!beaconSet.has(leftFromPointOnInspectedRow)) {
            notBeacons.add(leftFromPointOnInspectedRow);
          }
          const rightFromPointOnInspectedRow = point.at(pointOnInspectedRow.x + offset, inspectedRow);
          if (!beaconSet.has(rightFromPointOnInspectedRow)) {
            notBeacons.add(rightFromPointOnInspectedRow);
          }
        });
    }
  }
  return notBeacons.size;
}

log.write(solve(parsedInput));
