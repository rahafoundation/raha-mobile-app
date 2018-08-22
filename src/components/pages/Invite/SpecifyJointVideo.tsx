import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Container } from "../../shared/elements";

interface Props {
  onNo: () => void;
  onYes: () => void;
  onBack: () => void;
}

export const SpecifyJointVideo: React.StatelessComponent<Props> = props => {
  return (
    <Container style={styles.container}>
      <Text style={styles.back} onPress={props.onBack}>
        Back
      </Text>
      <Text style={styles.text}>
        Is the person you're inviting with you right now?
      </Text>
      <View style={styles.actionRow}>
        <Button title="No" style={styles.button} onPress={props.onNo} />
        <Button title="Yes" style={styles.button} onPress={props.onYes} />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
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
  },
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 12
  }
});
