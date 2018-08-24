import * as React from "react";
import { View } from "react-native";
import { Text, Button } from "../../shared/elements";
import { styles } from "./styles";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export const InviteSplash: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.page}>
      <Text style={styles.back} onPress={props.onBack}>
        Back
      </Text>
      <View style={styles.body}>
        <Text style={styles.header}>Invite a friend</Text>
        <Text style={styles.paragraph}>
          Currently, the network referral bonus is 60 Raha - meaning you can
          mint an extra 60 Raha for every friend that joins!
        </Text>
        <Text style={styles.paragraph}>
          Continue to send your friend a video inviting them to the network.
        </Text>
        <Button
          style={styles.button}
          title="Continue"
          onPress={props.onContinue}
        />
      </View>
    </View>
  );
};
