import { ViewStyle, TextStyle, StyleSheet } from "react-native";
import { fontSizes } from "../../../helpers/fonts";
import { colors, palette } from "../../../helpers/colors";

export const leftColumnWidth = 50;
const activitySpacing = 30;
const sectionSpacing = 10;
export const chainIndicatorColor = palette.veryLightGray;

const activityStyle: ViewStyle = {
  marginTop: activitySpacing - sectionSpacing,
  paddingHorizontal: 20,

  flexDirection: "column"
};

const contentSectionStyle: ViewStyle = {
  marginTop: sectionSpacing
};

const metadataRowStyle: ViewStyle = {
  ...contentSectionStyle
};

const timestampStyle: TextStyle = {
  ...fontSizes.small,
  color: colors.secondaryText
};

const actorRowStyle: ViewStyle = {
  ...contentSectionStyle,

  flexDirection: "row",
  alignItems: "center",
  overflow: "hidden"
};

const actorThumbnailStyle: ViewStyle = {
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: leftColumnWidth,
  marginRight: 10
};

const contentBodyRowStyle: ViewStyle = {
  ...contentSectionStyle,

  flexDirection: "row",
  alignItems: "center"
};

const invisibleStyle: ViewStyle = {
  opacity: 0
};

const chainIndicatorWidth = 3;
const chainIndicatorStyle: ViewStyle = {
  flexDirection: "column",
  alignItems: "center",
  height: "100%",
  flexGrow: 0
};

const chainIndicatorLineStyle: ViewStyle = {
  backgroundColor: chainIndicatorColor,
  width: chainIndicatorWidth,
  marginHorizontal: (leftColumnWidth - chainIndicatorWidth) / 2,
  minHeight: 50,
  flexGrow: 1
};

const descriptionStyle: TextStyle = {
  flexShrink: 1
};

const contentBodyStyle: ViewStyle = {
  flexShrink: 1,
  flexGrow: 1
};

const iconBodyStyle: TextStyle = {
  fontSize: 80,
  color: palette.mediumGray,
  textAlign: "center"
};

// TODO: calculate proper dimensions dynamically, so that different screen sizes
// render properly
const mediaBodyStyle: ViewStyle = {
  height: 300,
  width: 300
};

export const styles = StyleSheet.create({
  activity: activityStyle,
  metadataRow: metadataRowStyle,
  timestamp: timestampStyle,
  description: descriptionStyle,
  actorRow: actorRowStyle,
  actorThumbnail: actorThumbnailStyle,
  contentBodyRow: contentBodyRowStyle,
  contentBody: contentBodyStyle,
  mediaBody: mediaBodyStyle,
  iconBody: iconBodyStyle,
  invisible: invisibleStyle,
  chainIndicator: chainIndicatorStyle,
  chainIndicatorLine: chainIndicatorLineStyle
});
