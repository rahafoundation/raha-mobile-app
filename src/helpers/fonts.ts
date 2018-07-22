import { Platform, TextStyle } from "react-native";

const androidFonts = {
  OpenSans: {
    Bold: { fontFamily: "OpenSans-Bold" } as TextStyle,
    Normal: { fontFamily: "OpenSans-Regular" } as TextStyle,
    NormalItalic: { fontFamily: "OpenSans-Italic" } as TextStyle
  },
  Vollkorn: {
    SemiBold: { fontFamily: "Vollkorn-SemiBold" } as TextStyle
  }
};
const iosFonts: typeof androidFonts = {
  // iOS
  OpenSans: {
    Bold: { fontWeight: "700", fontStyle: "normal" },
    Normal: { fontWeight: "400", fontStyle: "normal" },
    NormalItalic: { fontWeight: "400", fontStyle: "italic" }
  },
  Vollkorn: {
    SemiBold: { fontWeight: "600", fontStyle: "normal" }
  }
};

export const fonts = Platform.OS === "android" ? androidFonts : iosFonts;
