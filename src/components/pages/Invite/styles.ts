import { ViewStyle, StyleSheet, TextStyle } from "react-native";
import { fontSizes, fonts } from "../../../helpers/fonts";

const page: ViewStyle = {
  height: "100%"
};

const body: ViewStyle = {
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center"
};

const paragraph: TextStyle = {
  ...fontSizes.medium,
  marginVertical: 4,
  marginHorizontal: 40,
  textAlign: "center"
};

const actionRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center"
};

const back: TextStyle = {
  padding: 12
};

const header: TextStyle = {
  ...fontSizes.large,
  ...fonts.Lato.Bold,
  marginVertical: 15,
  textAlign: "center"
};

const button: ViewStyle = {
  margin: 15
};

export const styles = StyleSheet.create({
  page,
  body,
  header,
  paragraph,
  button,
  actionRow,
  back
});
