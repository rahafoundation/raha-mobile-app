/**
 * TODO: this component seems extraneous, I'd rather we define components based
 * on their functional use than details about their styling for flexibility.
 * - osdiab
 */
import * as React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

type ButtonProps = {
  text: string;
  onPress: () => void;
  // TODO: figure out a better API for doing this
  backgroundColor?: string;
};

export const Button: React.StatelessComponent<ButtonProps> = props => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View
        style={[
          styles.button,
          ...(props.backgroundColor
            ? [{ backgroundColor: props.backgroundColor }]
            : [])
        ]}
      >
        <Text style={styles.text}>{props.text.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 10
  },
  // Button text
  text: {
    color: "#fff",
    fontWeight: "bold"
  }
});
