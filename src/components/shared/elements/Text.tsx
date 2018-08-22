/**
 * A wrapper around the native Text component to apply our own styles.
 */

import * as React from "react";
import {
  Text as NativeText,
  TextProps,
  TextStyle,
  StyleSheet
} from "react-native";

import { fonts, fontSizes } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";

export { TextProps } from "react-native";

/**
 * General purpose text component for the app, including app styling.
 */
export const Text: React.StatelessComponent<TextProps> = ({
  style,
  ...props
}) => {
  return <NativeText {...props} style={[styles.text, style]} />;
};

const textStyle: TextStyle = {
  ...fonts.Lato.Normal,
  ...fontSizes.medium,
  color: colors.bodyText
};
const styles = StyleSheet.create({
  text: textStyle
});
