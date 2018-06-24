const NUMBER_SUFFIX_LENGTH = 4;

const getNumberSuffix = (len: number, seedFn: () => number) => {
  const exclusiveMax = Math.pow(10, len);
  return (Math.floor(seedFn() * exclusiveMax) + exclusiveMax)
    .toString()
    .substring(1);
};

// See https://stackoverflow.com/questions/4328500/how-can-i-strip-all-punctuation-from-a-string-in-javascript-using-regex/
const removePunctuation = (str: string) => {
  return str.replace(/[,\/#!$%\^&\*;:{}=\_`~()]/g, "");
};

// TODO move server side
export const getUsername = (displayName: string, seedFn?: () => number) => {
  const userSlug = removePunctuation(displayName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".");
  const userPin = getNumberSuffix(NUMBER_SUFFIX_LENGTH, seedFn || Math.random);
  return userSlug + "." + userPin;
};

export function getInitialsForName(name: string): string {
  const initials = name.split(" ").map(part => part.charAt(0).toUpperCase());
  return initials[0] + initials[initials.length - 1];
}
