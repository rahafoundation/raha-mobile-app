import { Platform, TextStyle } from "react-native";

// bold font was patched to include Raha currency symbol at 0xE0E0,
// hence the different family name.

const androidFonts = {
  Lato: {
    Bold: { fontFamily: "Raha-Lato-Bold" } as TextStyle,
    Semibold: { fontFamily: "Lato-Semibold" } as TextStyle,
    Normal: { fontFamily: "Lato-Regular" } as TextStyle,
    Italic: { fontFamily: "Lato-Italic" } as TextStyle
  }
};
const iosFonts: typeof androidFonts = {
  // iOS
  Lato: {
    Bold: { fontFamily: "Raha Lato", fontWeight: "700", fontStyle: "normal" },
    Semibold: { fontFamily: "Lato", fontWeight: "600", fontStyle: "normal" },
    Normal: { fontFamily: "Lato", fontWeight: "400", fontStyle: "normal" },
    Italic: { fontFamily: "Lato", fontWeight: "400", fontStyle: "italic" }
  }
};

export const fonts = Platform.OS === "android" ? androidFonts : iosFonts;
