import * as React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

type RoundedButtonProps = {
  text: string;
  onPress: () => void;
};
const RoundedButton: React.StatelessComponent<RoundedButtonProps> = props => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={styles.button}>
        <Text style={styles.text}>{props.text.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
};
export default RoundedButton;

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    paddingHorizontal: 50,
    paddingVertical: 10
  },
  // Button text
  text: {
    color: "#fff",
    fontWeight: "bold"
  }
});
