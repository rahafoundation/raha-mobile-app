import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { fonts, fontSizes } from "../../helpers/fonts";
import { colors, palette } from "../../helpers/colors";

const bodyStyle: ViewStyle = {
  backgroundColor: colors.pageBackground
};

const headerStyle: ViewStyle = {
  backgroundColor: colors.darkAccent,
  padding: 20
};

const flaggedStatusStyle: ViewStyle = {
  backgroundColor: palette.paleMint
};

const headerProfileStyle: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center"
};

const headerDetailsStyle: ViewStyle = {
  flexGrow: 1
};

const statNumberStyle: TextStyle = {
  ...fonts.Lato.Bold,
  ...fontSizes.large
};

const statLabelStyle: TextStyle = {
  color: colors.bodyText,
  ...fontSizes.small
};

const memberNameStyle: TextStyle = {
  ...fonts.Lato.Semibold,
  ...fontSizes.medium
};

const memberUsernameStyle: TextStyle = {
  ...fonts.Lato.Semibold,
  ...fontSizes.small
};

const thumbnailStyle: ViewStyle = {
  flexGrow: 0,
  flexBasis: 120,

  flexDirection: "column",
  alignItems: "center",
  marginRight: 20
};

const detailsSpacer: ViewStyle = {
  marginTop: 5
};

const memberActionsStyle: ViewStyle = {
  marginTop: 20,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
};

const statsContainerStyle: ViewStyle = {
  ...detailsSpacer,

  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
};

const profileVideoStyle: ViewStyle = {
  width: "100%",
  aspectRatio: 1
};

const floatRightStyle: TextStyle = {
  textAlign: "right"
};

export const styles = StyleSheet.create({
  body: bodyStyle,
  header: headerStyle,
  flaggedStatus: flaggedStatusStyle,
  headerProfile: headerProfileStyle,
  thumbnail: thumbnailStyle,
  memberName: memberNameStyle,
  memberUsername: memberUsernameStyle,
  headerDetails: headerDetailsStyle,
  memberActions: memberActionsStyle,
  statsContainer: statsContainerStyle,
  profileVideo: profileVideoStyle,
  statNumber: statNumberStyle,
  statLabel: statLabelStyle,
  floatRight: floatRightStyle
});
