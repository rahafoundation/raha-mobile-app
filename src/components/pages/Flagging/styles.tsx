import { ViewStyle, TextStyle, StyleSheet } from "react-native";

import { colors, palette } from "../../../helpers/colors";
import { fonts, fontSizes } from "../../../helpers/fonts";

const PageStyle: ViewStyle = {
  backgroundColor: colors.pageBackground,
  padding: 16,
  display: "flex",
  alignContent: "center",
  flexGrow: 1
};

const HeaderStyle: ViewStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap"
};

const HeaderTextStyle: TextStyle = {
  marginLeft: 16,
  ...fonts.Lato.Bold,
  ...fontSizes.large
};

const SectionStyle: ViewStyle = {
  marginTop: 16
};

const NameStyle: TextStyle = { ...fonts.Lato.Bold };

const InfoHeaderStyle: TextStyle = {
  ...fonts.Lato.Bold
};

const InfoTextStyle: TextStyle = {
  ...fonts.Lato.Normal,
  ...fontSizes.medium
};

const InfoListItemStyle: TextStyle = {
  marginTop: 4,
  marginLeft: 8
};

const ButtonStyle: ViewStyle = {
  flexShrink: 1
};

const TextInputStyle: TextStyle = {
  borderColor: colors.navFocusTint,
  borderWidth: 1,
  borderRadius: 3,
  flexGrow: 1
};

const flagNoticeStyle: ViewStyle = {
  borderWidth: 2,
  borderColor: palette.red,
  borderRadius: 3,
  padding: 8,
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
};

export const styles = StyleSheet.create({
  page: PageStyle,
  header: HeaderStyle,
  headerText: HeaderTextStyle,
  section: SectionStyle,
  name: NameStyle,
  infoHeader: InfoHeaderStyle,
  infoText: InfoTextStyle,
  infoListItem: InfoListItemStyle,
  button: ButtonStyle,
  textInput: TextInputStyle,
  flagNotice: flagNoticeStyle
});
