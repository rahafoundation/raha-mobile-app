import * as React from "react";
import {
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  StyleProp,
  TextStyle,
  Text
} from "react-native";
import { fonts } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";

// TODO: add size, color options
interface ButtonProps {
  title: string;
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
      >
        {title.toUpperCase()}
      </Text>
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
  ...fonts.Lato.Bold
};
const disabledTextStyle: TextStyle = {};

const styles = StyleSheet.create({
  text: textStyle,
  button: buttonStyle,
  disabled: disabledStyle,
  disabledText: disabledTextStyle
});
