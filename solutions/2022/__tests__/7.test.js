import { jest } from '@jest/globals';

import * as actualAoCLib from "@Hyperlisk/aoc-lib";

jest.unstable_mockModule("@Hyperlisk/aoc-lib", () => {
  return {
    __esModule: true,
    ...actualAoCLib,
    log: {
      ...actualAoCLib.log,
      write: jest.fn(),
    },
  };
});

afterEach(async () => {
  const { log } = await import("@Hyperlisk/aoc-lib");
  log.write.mockClear();
});

describe("Part 1", () => {
  it("should pass", async () => {
    const answer = await actualAoCLib.input.fetchProblemAnswer(2022, 7, 1);

    await import("../../js/2022/7/1.js");

    const { log } = await import("@Hyperlisk/aoc-lib");

    expect(log.write).toHaveBeenCalledTimes(1);
    const output = String(log.write.mock.calls[0][0]);
    expect(output).toEqual(answer);
  });
});

describe("Part 2", () => {
  it("should pass", async () => {
    const answer = await actualAoCLib.input.fetchProblemAnswer(2022, 7, 2);

    await import("../../js/2022/7/2.js");

    const { log } = await import("@Hyperlisk/aoc-lib");

    expect(log.write).toHaveBeenCalledTimes(1);
    const output = String(log.write.mock.calls[0][0]);
    expect(output).toEqual(answer);
  });
});
