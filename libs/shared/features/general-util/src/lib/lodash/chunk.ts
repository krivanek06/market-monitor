export function chunk<T>(array: T[], size: number): T[][] {
  // Guard clause for non-positive sizes
  if (size < 1) {
    throw new Error('Size must be positive');
  }

  const result: T[][] = [];
  let currentChunk: T[] = [];

  for (const item of array) {
    // If the current chunk is full, push it to result and start a new chunk
    if (currentChunk.length === size) {
      result.push(currentChunk);
      currentChunk = [];
    }

    currentChunk.push(item);
  }

  // Don't forget to add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }

  return result;
}
