import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "../../shared/elements";

interface Props {
  onContinue: () => void;
}

export const InviteSplash: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.container}>
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
  }
});
