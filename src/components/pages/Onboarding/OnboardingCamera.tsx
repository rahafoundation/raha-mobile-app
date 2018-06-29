/**
 * Renders the onboarding camera preview screen which allows a user to record their
 * identity verification video.
 */

import * as React from "react";
import { StyleSheet } from "react-native";
import { Camera } from "../../shared/Camera";
import { Text } from "../../shared/elements";

type OwnProps = {
  inviterFullName: string;
  verifiedFullName: string;
  onVideoRecorded: (videoUri: string) => void;
};
type OnboardingCameraProps = OwnProps;

export class OnboardingCamera extends React.Component<OnboardingCameraProps> {
  render() {
    return (
      <React.Fragment>
        <Text style={styles.text}>
          Please record a video with {this.props.inviterFullName} to verify your
          identity.
        </Text>
        <Camera
          onVideoRecorded={uri => {
            this.props.onVideoRecorded(uri);
          }}
        />
        <Text style={styles.text}>Example of what to say:</Text>
        <Text style={styles.text}>
          {this.props.inviterFullName}: "Hi, my name is{" "}
          {this.props.inviterFullName}, and I'm inviting{" "}
          {this.props.verifiedFullName} to Raha."
        </Text>
        <Text style={styles.text}>
          You: "My name is {this.props.verifiedFullName} and I'm joining Raha
          because I believe every life has value."
        </Text>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    textAlign: "center"
  }
});
