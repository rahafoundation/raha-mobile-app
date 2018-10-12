import { ViewStyle, TextStyle, StyleSheet } from "react-native";

import { palette } from "../../../helpers/colors";
import { fonts } from "../../../helpers/fonts";

const card: ViewStyle = {
  borderWidth: 2,
  borderRadius: 3,
  marginBottom: 8,
  padding: 8,
  display: "flex",
  flexDirection: "row",
  flex: 1,
  alignItems: "center"
};

const error: ViewStyle = {
  borderColor: palette.red
};

const alert: ViewStyle = {
  borderColor: palette.purple
};

const cardErrorIcon: TextStyle = {
  color: palette.red
};

const cardBody: ViewStyle = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  marginLeft: 12
};

const cardBodyAction: TextStyle = {
  marginTop: 4,
  ...fonts.Lato.Bold
};

export const styles = StyleSheet.create({
  card,
  error,
  alert,
  cardErrorIcon,
  cardBody,
  cardBodyAction
});
