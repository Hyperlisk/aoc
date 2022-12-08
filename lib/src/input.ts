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

export async function fetchProblem(year: number, day: number) {
  const cachePath = `js/${year}/${day}/problem.txt`;
  const inputIsCached = await fs.promises.access(cachePath).then(() => true, () => false);
  if (inputIsCached) {
    const cachedData = await fs.promises.readFile(cachePath);
    return cachedData.toString('utf-8');
  }

  const sessionToken = requireSessionFromEnv();

  const problem = await fetch(
    `https://adventofcode.com/${year}/day/${day}`,
    {
      headers: {
        Cookie: `session=${sessionToken}`,
      },
    },
  );

  const problemData = await problem.text();

  try {
    await fs.promises.writeFile(cachePath, problemData);
  } catch (e) {
    log.error("Unable to cache problem file:", e);
  }

  return problemData;
}

export async function fetchProblemAnswer(year: number, day: number, part: 1 | 2) {
  const problemText = await fetchProblem(year, day);
  const matchedAnswers = problemText.match(/puzzle answer [^>]+([^<]+)/g);
  if (!matchedAnswers || matchedAnswers.length < part) {
    throw new Error(`You have not solved part ${part} of ${year}/${day} yet.`);
  }
  return matchedAnswers.map((code) => code.split('>')[1])[part - 1];
}

export function parse<Result>(inputData: string, dataSplitter: string, dataMapper: DataMapper<Result>, dataFilter: (data: string) => boolean = Boolean): Array<Result> {
  return inputData.split(dataSplitter)
    .filter((data) => dataFilter(data))
    .map((data) => dataMapper(data));
}

parse.split = {
  character: "",
  group: "\n\n",
  line: "\n",
  space: " ",
};
