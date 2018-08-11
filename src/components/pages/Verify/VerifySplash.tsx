import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "../../shared/elements";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export const VerifySplash: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.container}>
      <Text style={styles.back} onPress={props.onBack}>
        Back
      </Text>
      <Text style={styles.header}>Verify a friend</Text>
      <Text style={styles.text}>
        Take a video of yourself verifying your friend's identity.
      </Text>
      <Text style={styles.text}>
        Verification helps other members know who to trust, and people must be
        verified before they can claim their basic income.
      </Text>
      <Button
        style={styles.continue}
        title="Continue"
        onPress={props.onContinue}
      />
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
  continue: {
    margin: 12
  },
  back: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: 12
  }
});
