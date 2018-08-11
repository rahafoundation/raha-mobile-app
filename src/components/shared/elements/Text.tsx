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

import { fonts } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";

export const Text: React.StatelessComponent<TextProps> = props => {
  return <NativeText {...props} style={[styles.text, props.style]} />;
};

const styles = StyleSheet.create({
  text: {
    ...fonts.Lato.Normal,
    color: colors.bodyText
  } as TextStyle
});
