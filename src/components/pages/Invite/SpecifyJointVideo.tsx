import * as React from "react";
import { View } from "react-native";
import { Text, Button } from "../../shared/elements";
import { styles } from "./styles";

interface Props {
  onNo: () => void;
  onYes: () => void;
  onBack: () => void;
}

export const SpecifyJointVideo: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.page}>
      <Text style={styles.back} onPress={props.onBack}>
        Back
      </Text>
      <View style={styles.body}>
        <Text style={styles.paragraph}>
          Is the person you're inviting with you right now?
        </Text>
        <View style={styles.actionRow}>
          <Button title="No" style={styles.button} onPress={props.onNo} />
          <Button title="Yes" style={styles.button} onPress={props.onYes} />
        </View>
      </View>
    </View>
  );
};
