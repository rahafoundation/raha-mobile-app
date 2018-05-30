/**
 * Returns array of numbers counting up from startIdx [default 0] of
 * the given size. Size must be > 0.
 */
export function range(size: number, startIdx = 0) {
  if (size <= 0) {
    throw new Error("Size must be >= 0");
  }
  return Array.from(Array(size).keys()).map(i => i + startIdx);
}
