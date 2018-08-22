/**
 * Renders the onboarding camera preview screen which allows a user to record their
 * identity verification video.
 */

import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Camera } from "../../shared/Camera";
import { Text, Container } from "../../shared/elements";

type OwnProps = {
  verifiedFullName: string;
  onVideoRecorded: (videoUri: string) => void;
};
type OnboardingCameraProps = OwnProps;

export class OnboardingCamera extends React.Component<OnboardingCameraProps> {
  render() {
    return (
      <Container>
        <Text style={styles.headerText}>
          Please record a video of yourself stating your identity.
        </Text>
        <Camera
          onVideoRecorded={uri => {
            this.props.onVideoRecorded(uri);
          }}
        />
        <View style={styles.promptContainer}>
          <Text style={styles.promptHeader}>Example of what to say:</Text>
          <Text style={styles.text}>
            "My name is {this.props.verifiedFullName} and I'm joining Raha
            because I believe every life has value."
          </Text>
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    margin: 4,
    textAlign: "center",
    fontSize: 12
  },
  text: {
    fontSize: 12,
    textAlign: "center"
  },
  promptHeader: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: "center"
  },
  promptContainer: {
    padding: 8
  }
});
