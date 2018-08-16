export const palette = {
  offWhite: "#ffffff",
  veryLightGray: "#dadada",
  lightGray: "#aeaeae",
  mediumGray: "#7b7b7b",
  darkGray: "#222222",

  blue: "#5ec3e9",
  blueWhite: "#fbffff",
  paleBlue: "#cff2ff",
  darkBlue: "#73c3e1",

  mint: "#96E6B3",
  mintWhite: "#f0fff5",
  paleMint: "#d2fbe1",
  darkMint: "#509f6d",

  lavender: "#cb6ddf",
  red: "#da3e52"
};

export const colors = {
  brandColor: palette.mint,

  // Main
  pageBackground: palette.offWhite,
  primaryBorder: palette.mint,
  darkBackground: palette.mint,

  // Text
  bodyText: palette.darkGray,
  secondaryText: palette.lightGray,

  // Components
  divider: palette.lightGray,
  button: palette.blue,
  disabledButton: palette.paleBlue,
  lightAccent: palette.blueWhite,
  darkAccent: palette.mint,

  // Activity Feed, Account
  arrowColor: palette.lightGray,
  letterBackground: palette.blueWhite,
  border1: palette.mint,
  border2: palette.darkBlue,
  secondaryBackground1: palette.paleMint,
  secondaryBackground2: palette.paleBlue,

  // Currency
  currency: {
    positive: palette.darkMint,
    negative: palette.red,
    donation: palette.lavender
  }
};
