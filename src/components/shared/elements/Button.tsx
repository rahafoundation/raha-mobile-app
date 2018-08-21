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
import { Text } from "./Text";
import { MixedTextProps, MixedText } from "./MixedText";

// TODO: add size, color options
interface BaseButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

const ArbitraryButton: React.StatelessComponent<BaseButtonProps> = props => {
  const { onPress, style, disabled, disabledStyle } = props;

  const disabledStyles = [
    styles.disabled,
    ...(disabledStyle ? [disabledStyle] : [])
  ];

  return (
    <TouchableOpacity
      style={[styles.button, style, ...(disabled ? disabledStyles : [])]}
      onPress={onPress}
      disabled={disabled}
    >
      {props.children}
    </TouchableOpacity>
  );
};

interface TextBodyProps {
  children?: undefined;
  title: MixedTextProps["content"];
  textStyle?: StyleProp<TextStyle>;
  disabledTextStyle?: StyleProp<TextStyle>;
}

export type ButtonProps = BaseButtonProps & TextBodyProps;

/**
 * Button component for the app. Title may be text or mixed content as defined
 * in MixedText.
 */
export const Button: React.StatelessComponent<ButtonProps> = props => {
  const disabledTextStyles = [
    styles.disabledText,
    ...(disabledTextStyle ? [disabledTextStyle] : [])
  ];

  return (
    <ArbitraryButton {...props}>
      <MixedText
        style={[
          styles.text,
          props.textStyle,
          ...(props.disabled ? disabledTextStyles : [])
        ]}
        content={props.title}
        textTransform={s => s.toUpperCase()}
      />
    </ArbitraryButton>
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
