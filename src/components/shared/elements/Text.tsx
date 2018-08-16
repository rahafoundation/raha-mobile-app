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

export const Text: React.StatelessComponent<TextProps> = props => {
  return <NativeText {...props} style={[styles.text, props.style]} />;
};

const textStyle: TextStyle = {
  ...fonts.Lato.Normal,
  ...fontSizes.medium,
  color: colors.bodyText
};
const styles = StyleSheet.create({
  text: textStyle
});
