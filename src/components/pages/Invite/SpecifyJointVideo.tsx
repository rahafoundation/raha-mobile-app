import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "../../shared/elements";

interface Props {
  onNo: () => void;
  onYes: () => void;
}

export const SpecifyJointVideo: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Is this a joint video?</Text>
      <Text style={styles.text}>
        If you are with the person you're inviting, you can simultaneously
        invite them to the network and verify their identity by taking the video
        together.
      </Text>
      <Text style={styles.text}>
        If not, they will have to take a video of themselves verifying their
        identity when they join the network.
      </Text>
      <View style={styles.actionRow}>
        <Button title="No" style={styles.button} onPress={props.onNo} />
        <Button title="Yes" style={styles.button} onPress={props.onYes} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center"
  },
  text: {
    fontSize: 18,
    marginVertical: 4,
    marginHorizontal: 40,
    textAlign: "center"
  },
  button: {
    margin: 12
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  }
});
