import * as fs from "fs";
import fetch from "node-fetch";

import * as log from "./log.js";
import { requireSessionFromEnv } from "./aoc.js";

type DataMapper<T> = (data: string) => T;

export async function fetchProblemInput(year: number, day: number) {
  const cachePath = `js/${year}/${day}/input.txt`;
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

export function parse<Result>(inputData: string, dataMapper: DataMapper<Result>, dataSplitter: string, dataFilter: (data: string) => boolean = Boolean): Array<Result> {
  return inputData.split(dataSplitter).filter(data => dataFilter(data)).map(data => dataMapper(data));
}

parse.split = {
  character: "",
  group: "\n\n",
  line: "\n",
  space: " ",
};
