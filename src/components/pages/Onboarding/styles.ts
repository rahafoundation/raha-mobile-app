/**
 * TODO: Share styles with rest of app
 */
import { ViewStyle, TextStyle, StyleSheet } from "react-native";
import { fontSizes, fonts } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";

const cardPageContainer: ViewStyle = {
  backgroundColor: colors.darkBackground
};

const page: ViewStyle = {
  height: "100%"
};

const body: ViewStyle = {
  flex: 1,
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start"
};

const card: ViewStyle = {
  alignSelf: "stretch",
  backgroundColor: colors.pageBackground,
  margin: 12,
  padding: 12,
  borderRadius: 12
};

const header: TextStyle = {
  ...fontSizes.large,
  ...fonts.Lato.Bold,
  marginVertical: 15,
  textAlign: "center"
};

const button: ViewStyle = {
  marginVertical: 8
};

const paragraphText: TextStyle = {
  ...fontSizes.medium
};
const paragraph: TextStyle = {
  ...paragraphText,
  marginVertical: 12,
  marginHorizontal: 40,
  textAlign: "center"
};

const back: TextStyle = {
  padding: 12
};

const input: ViewStyle = {
  margin: 8
};

export const styles = StyleSheet.create({
  cardPageContainer,
  page,
  body,
  card,
  header,
  paragraph,
  paragraphText,
  button,
  back,
  input
});
