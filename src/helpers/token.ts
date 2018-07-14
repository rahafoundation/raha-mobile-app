/**
 * Generates an alphanumeric string token of length 10 or 11.
 */
export function generateToken() {
  return Math.random()
    .toString(36)
    .slice(2)
    .toString();
}
