import * as React from "react";
import { View } from "react-native";
import { Text, Button } from "../../shared/elements";
import { styles } from "./styles";

interface Props {
  onRemote: () => void;
  onInPerson: () => void;
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
          Would you like to create an in-person video together or invite your
          friend remotely?
        </Text>
        <View style={styles.actionRow}>
          <Button
            title="In-Person Invite"
            style={styles.button}
            onPress={props.onInPerson}
          />
        </View>
        <View style={styles.actionRow}>
          <Button
            title="Remote Invite"
            style={styles.button}
            onPress={props.onRemote}
          />
        </View>
      </View>
    </View>
  );
};
