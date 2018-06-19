/**
 * Renders the onboarding camera preview screen which allows a user to record their
 * identity verification video.
 */

import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Camera } from "../../shared/Camera";
import { RouteName } from "../../shared/Navigation";
import { Member } from "../../../store/reducers/members";

type OnboardingCameraProps = {
  navigation: any;
  invitingMember: Member;
};

export class OnboardingCamera extends React.Component<OnboardingCameraProps> {
  render() {
    return (
      <React.Fragment>
        <Camera
          onVideoRecorded={uri => {
            this.props.navigation.navigate(RouteName.VideoPreview, {
              videoUri: uri
            });
          }}
        />
        <Text style={styles.text}>Please record a video with</Text>
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
    fontSize: 12,
    textAlign: "center"
  }
});
