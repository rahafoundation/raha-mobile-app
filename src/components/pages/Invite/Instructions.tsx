import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Container } from "../../shared/elements";

interface Props {
  isJointVideo: boolean;
  onContinue: () => void;
  onBack: () => void;
}

export const Instructions: React.StatelessComponent<Props> = props => {
  return (
    <Container style={styles.container}>
      <Text style={styles.back} onPress={props.onBack}>
        Back
      </Text>
      {props.isJointVideo ? (
        <Text style={styles.text}>
          Great! Record a video together to verify your friend's identity.
        </Text>
      ) : (
        <Text style={styles.text}>
          That's fine! Record a video of yourself inviting them to Raha. Once
          they record their acceptance video, you'll be able to verify their
          identity.
        </Text>
      )}
      <View style={styles.actionRow}>
        <Button
          title="Record video"
          style={styles.button}
          onPress={props.onContinue}
        />
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
