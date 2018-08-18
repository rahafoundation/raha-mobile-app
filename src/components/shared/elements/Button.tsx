import * as React from "react";
import {
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  StyleProp,
  TextStyle
} from "react-native";
import { fonts } from "../../../helpers/fonts";
import { colors, palette } from "../../../helpers/colors";
import { CurrencyValue } from "../Currency";
import { Text } from "./Text";

// TODO: add size, color options
interface ButtonProps {
  title: string | (string | CurrencyValue)[];
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  disabledTextStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const Button: React.StatelessComponent<ButtonProps> = props => {
  const {
    title,
    onPress,
    style,
    textStyle,
    disabled,
    disabledTextStyle,
    disabledStyle
  } = props;

  const disabledStyles = [
    styles.disabled,
    ...(disabledStyle ? [disabledStyle] : [])
  ];
  const disabledTextStyles = [
    styles.disabledText,
    ...(disabledTextStyle ? [disabledTextStyle] : [])
  ];

  return (
    <TouchableOpacity
      style={[styles.button, style, ...(disabled ? disabledStyles : [])]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={[
          styles.text,
          textStyle,
          ...(disabled ? disabledTextStyles : [])
        ]}
        compoundContent={{
          content: typeof title === "string" ? [title] : title,
          textTransform: (s: string) => s.toUpperCase()
        }}
      />
    </TouchableOpacity>
  );
};

const buttonStyle: ViewStyle = {
  backgroundColor: colors.button,
  borderRadius: 2,
  paddingVertical: 10,
  paddingHorizontal: 20
};

const disabledStyle: ViewStyle = {
  backgroundColor: colors.disabledButton
};

const textStyle: TextStyle = {
  ...fonts.Lato.Bold,
  color: palette.offWhite,
  textAlign: "center"
};
const disabledTextStyle: TextStyle = {};

const styles = StyleSheet.create({
  text: textStyle,
  button: buttonStyle,
  disabled: disabledStyle,
  disabledText: disabledTextStyle
});
