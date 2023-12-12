import {array, input, log} from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 5);
const data = input.parse(
  inputData,
  input.parse.split.line,
  String,
);


function solve(lines: string[]) {
  const maps: Record<string, [destStart:number, srcStart: number, size: number][]> = {};
  let newMapName = '';
  let seeds: number[] = [];
  lines.forEach((line) => {
    const parts = line.split(/\s+/);
    if (parts.length === 0) {
      // Nothing to do
    } else if (parts[0] === 'seeds:') {
      seeds = parts.slice(1).map((n) => parseInt(n, 10));
    } else if (parts[1] === 'map:') {
      newMapName = parts[0];
    } else {
      const dest = parseInt(parts[0], 10);
      const source = parseInt(parts[1], 10);
      const size = parseInt(parts[2], 10);
      if (newMapName in maps) {
        maps[newMapName].push([dest, source, size]);
      } else {
        maps[newMapName] = [];
      }
    }
  });

  const readMap = (map: [destStart:number, srcStart: number, size: number][], source: number): number => {
    let result: number = source;
    map.forEach(([destStart, srcStart, size]) => {
      if (source >= srcStart && source <= (srcStart + size)) {
        result = destStart + (source - srcStart);
      }
    });
    return result;
  };

  let lowestLocation = Infinity;
  seeds.forEach((seed) => {
    const seedToSoil = readMap(maps['seed-to-soil'], seed) || +seed;
    const soilToFertilizer = readMap(maps['soil-to-fertilizer'], seedToSoil) || +seedToSoil;
    const fertilizerToWater = readMap(maps['fertilizer-to-water'], soilToFertilizer) || +soilToFertilizer;
    const waterToLight = readMap(maps['water-to-light'], fertilizerToWater) || +fertilizerToWater;
    const lightToTemperature = readMap(maps['light-to-temperature'], waterToLight) || +waterToLight;
    const temperatureToHumidity = readMap(maps['temperature-to-humidity'], lightToTemperature) || +lightToTemperature;
    const location = readMap(maps['humidity-to-location'], temperatureToHumidity) || +temperatureToHumidity;
    if (location < lowestLocation) {
      lowestLocation = location;
    }
  });
  return lowestLocation;
}

const solution = solve(data);
log.write(solution);
