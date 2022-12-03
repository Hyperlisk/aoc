import fetch from "node-fetch";

import { requireSessionFromEnv } from "./aoc.js";

export async function fetchProblemInput(year: number, day: number, part: 1 | 2) {
  const sessionToken = requireSessionFromEnv();

  const input = await fetch(
    `https://adventofcode.com/${year}/day/${day}/input`,
    {
      headers: {
        Cookie: `session=${sessionToken}`,
      },
    },
  );

  return await input.text();
}
