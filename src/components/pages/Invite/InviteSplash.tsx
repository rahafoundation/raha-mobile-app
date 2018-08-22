import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Container } from "../../shared/elements";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export const InviteSplash: React.StatelessComponent<Props> = props => {
  return (
    <Container style={styles.container}>
      <Text style={styles.back} onPress={props.onBack}>
        Back
      </Text>
      <Text style={styles.header}>Invite a friend</Text>
      <Text style={styles.text}>
        Currently, the network referral bonus is 60 Raha - meaning you can mint
        an extra 60 Raha for every friend that joins!
      </Text>
      <Text style={styles.text}>
        Continue to send your friend a video inviting them to the network.
      </Text>
      <Button
        style={styles.continue}
        title="Continue"
        onPress={props.onContinue}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
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
