import * as fs from "fs";
import fetch from "node-fetch";

import * as log from "./log.js";
import { requireSessionFromEnv } from "./aoc.js";

export async function fetchProblemInput(year: number, day: number, part: 1 | 2) {
  const cachePath = `js/${year}/${day}/${part}.input.txt`;
  const inputIsCached = await fs.promises.access(cachePath).then(() => true, () => false);
  if (inputIsCached) {
    const cachedData = await fs.promises.readFile(cachePath);
    return cachedData.toString('utf-8');
  }

  const sessionToken = requireSessionFromEnv();

  const input = await fetch(
    `https://adventofcode.com/${year}/day/${day}/input`,
    {
      headers: {
        Cookie: `session=${sessionToken}`,
      },
    },
  );

  const inputData = await input.text();

  try {
    await fs.promises.writeFile(cachePath, inputData);
  } catch (e) {
    log.error("Unable to cache input file:", e);
  }

  return inputData;
}
