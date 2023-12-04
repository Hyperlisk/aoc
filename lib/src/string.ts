
type ChunkWithLength<Length> = string & { length: Length };

type ChunkOptions = {
  gap: number;
};

export function chunk<N extends number>(input: string, chunkSize: N, options?: ChunkOptions): Array<ChunkWithLength<N>> {
  // Build options.
  const { gap } = {
    // Default options
    gap: 0,
    // Ovverride with user-specified options.
    ...options,
  };
  if (input.length % (chunkSize + gap) !== chunkSize) {
    throw new Error(`Input length of ${input.length} can not be split into chunks of size ${chunkSize} with a gap of ${gap}`);
  }
  const result: Array<ChunkWithLength<N>> = [];
  for (let i = 0;i < input.length;i += chunkSize + gap) {
    const chunk: ChunkWithLength<N> = input.substring(i, i + chunkSize) as ChunkWithLength<N>;
    result.push(chunk);
  }
  return result;
}

export const is = {
  digit: (s: string) => /^\d$/.test(s),
  digits: (s: string) => /^\d+$/.test(s),
};
