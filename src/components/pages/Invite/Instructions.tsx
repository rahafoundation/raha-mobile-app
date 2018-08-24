import * as React from "react";
import { View } from "react-native";
import { Text, Button } from "../../shared/elements";
import { styles } from "./styles";

interface Props {
  isJointVideo: boolean;
  onContinue: () => void;
  onBack: () => void;
}

export const Instructions: React.StatelessComponent<Props> = props => {
  return (
    <View style={styles.page}>
      <Text style={styles.back} onPress={props.onBack}>
        Back
      </Text>
      <View style={styles.body}>
        {props.isJointVideo ? (
          <Text style={styles.paragraph}>
            Great! Record a video together to verify your friend's identity.
          </Text>
        ) : (
          <Text style={styles.paragraph}>
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
      </View>
    </View>
  );
};
