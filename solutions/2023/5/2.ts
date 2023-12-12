import { array, input, log } from "@Hyperlisk/aoc-lib";

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
        maps[newMapName] = [[dest, source, size]];
      }
    }
  });


  /*
    mapA: [[4, 1, 5]]
    mapB: [[1, 4, 2], [10, 7, 2]]

    expected result: [[1, 1, 2], [6, 3, 1], [10, 4, 2]]

    Visualization:

    1         1
    2 \     / 2
    3 \\   //
    4 \\ 4 /
    5 \\ 5
      \\ 6 .. 6
       \ 7
         8 \
           \\
            \ 10
              11
  */
  const combineMap = (mapA: [destStart:number, srcStart: number, size: number][], mapB: [destStart:number, srcStart: number, size: number][]): [destStart:number, srcStart: number, size: number][] => {
    // log.write('Combining', mapA, mapB);
    const result: [destStart:number, srcStart: number, size: number][] = [];
    let remaining = mapA.slice(0);
    mapB.forEach(([destStartB, srcStartB, sizeB]) => {
      const unprocessed: typeof remaining = [];
      for (const [destStartA, srcStartA, sizeA] of remaining) {
        const startIsInB = destStartA >= srcStartB && destStartA <= srcStartB + sizeB - 1;
        const endIsInB = destStartA + sizeA - 1 >= srcStartB && destStartA + sizeA - 1 <= srcStartB + sizeB - 1;
        const bIsInA = destStartA <= srcStartB && destStartA + sizeA - 1 > srcStartB + sizeB - 1;
        if (startIsInB) {
          // Offset of A start from the start of B
          const offset = destStartA - srcStartB;
          if (endIsInB) {
            // All of A is mapped into B
            result.push([destStartB + offset, srcStartA, sizeA]);
          } else {
            // Only some part of A is mapped into B
            const processedSize = sizeA - ((destStartA + sizeA) - (srcStartB + sizeB));
            // log.write([destStartA, srcStartA, sizeA], [destStartB, srcStartB, sizeB], 'processedSize start', processedSize);
            result.push([destStartB + offset, srcStartA, processedSize]);
            unprocessed.push([destStartA + processedSize, srcStartA + processedSize, sizeA - processedSize]);
          }
        } else if (endIsInB) {
          // Only some part of A is mapped into B
          // Offset of A end from the start of B
          const processedSize = (destStartA + sizeA) - srcStartB;
          // log.write([destStartA, srcStartA, sizeA], [destStartB, srcStartB, sizeB], 'processedSize end', processedSize);
          unprocessed.push([destStartA, srcStartA, sizeA - processedSize]);
          result.push([destStartB, srcStartA + sizeA - processedSize, processedSize]);
        } else if (bIsInA) {
          const offset = srcStartB - destStartA;
          const processedSize = sizeB;
          // log.write([destStartA, srcStartA, offset], [destStartB, srcStartB, sizeB], 'processedSize mid', processedSize);
          unprocessed.push([destStartA, srcStartA, offset]);
          result.push([destStartB, srcStartA + offset, processedSize]);
          unprocessed.push([destStartA + offset + processedSize, srcStartA + offset + processedSize, sizeA - processedSize - offset]);
        } else {
          unprocessed.push([destStartA, srcStartA, sizeA]);
        }
      }
      remaining = unprocessed;
    });
    return result.concat(remaining);
  };
  
  maps['seed-to-fertilizer'] = combineMap(maps['seed-to-soil'], maps['soil-to-fertilizer']);
  maps['seed-to-water'] = combineMap(maps['seed-to-fertilizer'], maps['fertilizer-to-water']);
  maps['seed-to-light'] = combineMap(maps['seed-to-water'], maps['water-to-light']);
  maps['seed-to-temperature'] = combineMap(maps['seed-to-light'], maps['light-to-temperature']);
  maps['seed-to-humidity'] = combineMap(maps['seed-to-temperature'], maps['temperature-to-humidity']);
  maps['seed-to-location'] = combineMap(maps['seed-to-humidity'], maps['humidity-to-location']);

  let lowest = Infinity;
  for (const [dest, src, size] of maps['seed-to-location']) {
    for (const [seedRangeStart, seedRangeSize] of array.chunk(seeds, 2)) {
      // log.write('Checking', [seedRangeStart, seedRangeSize], 'against', [dest, src, size]);
      const seedStartInRange = seedRangeStart >= src && seedRangeStart <= src + size - 1;
      const seedEndInRange = seedRangeStart + seedRangeSize - 1 >= src && seedRangeStart + seedRangeSize - 1 <= src + size - 1;
      const rangeInSeedRange = src >= seedRangeStart && src + size - 1 <= seedRangeStart + seedRangeSize - 1;
      if (seedStartInRange && !seedEndInRange) {
        const offset = seedRangeStart - src;
        const location = dest + offset;
        // log.write('L',  [dest, src, size], [seedRangeStart, seedRangeSize], offset, location, lowest);
        if (location < lowest) {
          lowest = location;
        }
      }
      if (!seedStartInRange && seedEndInRange && dest < lowest) {
        // log.write('L', [dest, src, size], [seedRangeStart, seedRangeSize], dest, lowest);
        lowest = dest;
      }
      if (rangeInSeedRange && dest < lowest) {
        // log.write('l',  [dest, src, size], [seedRangeStart, seedRangeSize], dest, lowest);
        lowest = dest;
      }
    }
  }

  return lowest;
}

const solution = solve(data);
log.write(solution);
