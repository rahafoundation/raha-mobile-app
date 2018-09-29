import { ViewStyle, StyleSheet, TextStyle } from "react-native";
import { colors } from "../../../helpers/colors";
import { fonts } from "../../../helpers/fonts";

/**
 * Styles for Account pages.
 */

const pageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground
};

const rowStyle: ViewStyle = {
  marginTop: 12,
  marginHorizontal: 12
};

const memberRowStyle: ViewStyle = {
  ...rowStyle,

  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start"
};

const memberThumbnailStyle: ViewStyle = {
  marginRight: 8
};

const comingSoonStyle: TextStyle = {
  ...fonts.Lato.Italic
};

export const styles = StyleSheet.create({
  page: pageStyle,
  row: rowStyle,
  memberRow: memberRowStyle,
  memberThumbnail: memberThumbnailStyle,
  comingSoon: comingSoonStyle
});
