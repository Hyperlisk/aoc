

import { array, comparator, ds, grid, input, log, virtual } from "@Hyperlisk/aoc-lib";

const inputData = await input.fetchProblemInput(2023, 15);
const DATA = input.parse(
  inputData,
  input.parse.split.line,
  String
);

function hash(s: string) {
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    result += s.charCodeAt(i);
    result *= 17;
    result %= 256;
  }
  return result;
}


function solve(data: typeof DATA) {
  let result = 0;
  const mem: Record<string, ds.SetND<[focalSize: number, label: string, orderValue: number]>> = Object.create(null);
  const ANY = Infinity;
  let order = 0;
  for (const line of data) {
    const steps = line.split(',').map((part) => part.match(/([^-=]+)([-=])(\d*)/));
    for (const step of steps) {
      if (!step) {
        throw new Error(line);
      }
      const [, label, operation, focalSize] = step;
      const labelHash = hash(label);
      // log.write(label, operation, focalSize, labelHash);
      if (!(labelHash in mem)) {
        mem[labelHash] = ds.setND(
          ([a, labelA, orderA], [b, labelB, orderB]) => {
            const labelCmp = comparator.strings(labelA, labelB);
            if (labelCmp === 0) {
              return 0;
            }
            if (orderA !== ANY && orderB !== ANY) {
              const orderCmp = comparator.numbers(orderA, orderB);
              if (orderCmp !== 0) {
                return orderCmp;
              }
            }
            if (a !== ANY && b !== ANY) {
              const focalSizeCmp = comparator.numbers(a, b);
              if(focalSizeCmp !== 0) {
                return focalSizeCmp;
              }
            }
            return labelCmp;
          }
        );
      }
      if (operation === '-') {
        const saved = mem[labelHash].values().find(([, savedLabel]) => savedLabel === label);
        // log.write(saved);
        if (saved !== undefined) {
          mem[labelHash].delete(saved);
        }
        if (mem[labelHash].size === 0) {
          delete mem[labelHash];
        }
      }
      if (operation === '=') {
        const saved = mem[labelHash].values().find(([, savedLabel]) => savedLabel === label);
        // log.write(saved);
        if (saved !== undefined) {
          // mem[labelHash].delete(saved);
          mem[labelHash].add([Number(focalSize), label, saved[2]]);
        } else {
          mem[labelHash].add([Number(focalSize), label, order++]);
        }
      }
      // log.write(log.stringify(mem));
      // log.write();
      // log.write();
    }
  }

  Object.keys(mem).forEach((boxNumberString) => {
    const boxNumber = Number(boxNumberString);
    mem[boxNumberString].values().forEach(([focalSize, label], lensNumber) => {
      result += (boxNumber + 1) * (lensNumber + 1) * focalSize;
    });
  });

  return result;
}

const solution = solve(DATA);
log.write(solution);
