/**
 * Renders the onboarding camera preview screen which
 */

import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import Camera from "../shared/Camera";

type OnboardingCameraProps = {};

export default class OnboardingCamera extends React.Component<
  OnboardingCameraProps
> {
  render() {
    return (
      <React.Fragment>
        <Camera
          onVideoRecorded={uri => {
            console.log("Video URI: " + uri);
          }}
        />
        <Text style={styles.text}>
          Example: "My name is Jane Doe and I'm joining Raha because I believe
          every life has value."
        </Text>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    textAlign: "center"
  }
});
