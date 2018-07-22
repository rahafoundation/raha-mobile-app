import * as React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Button as NativeButton, ButtonProps } from "react-native-elements";
import { fonts } from "../../../helpers/fonts";
import { colors } from "../../../helpers/colors";

export const Button: React.StatelessComponent<ButtonProps> = props => {
  return (
    <TouchableOpacity {...props} style={[styles.buttonContainer, props.style]}>
      <NativeButton
        style={fonts.OpenSans.Bold}
        {...props}
        buttonStyle={styles.button}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: colors.button,
    borderRadius: 3
  },
  button: {
    backgroundColor: colors.button
  }
});
