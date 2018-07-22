/**
 * A wrapper around the native TextInput component to apply our own styles.
 */

import * as React from "react";
import {
  TextInput as NativeTextInput,
  TextStyle,
  StyleSheet,
  TextInputProps
} from "react-native";

import { fonts } from "../../../helpers/fonts";

export const TextInput: React.StatelessComponent<TextInputProps> = props => {
  return <NativeTextInput {...props} style={[styles.text, props.style]} />;
};

const styles = StyleSheet.create({
  text: {
    ...fonts.OpenSans.Normal
  } as TextStyle
});
