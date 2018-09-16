/**
 * NOT SAFE FOR CRYPTO USAGE.
 */
function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Returns a randomly generated identifier.
 */
export function generateRandomIdentifier() {
  return getRandomInt(Number.MAX_SAFE_INTEGER).toString();
}
