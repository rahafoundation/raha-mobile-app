/**
 * Renders the onboarding camera preview screen which allows a user to record their
 * identity verification video.
 */

import * as React from "react";
import { Text, StyleSheet, View } from "react-native";
import { Camera } from "../../shared/Camera";
import { RouteName } from "../../shared/Navigation";
import { Member } from "../../../store/reducers/members";
import { NavigationScreenProps } from "react-navigation";

interface NavParams {
  invitingMember?: Member;
  verifiedName?: string;
}
type OnboardingCameraProps = NavigationScreenProps<NavParams>;

export class OnboardingCamera extends React.Component<OnboardingCameraProps> {
  render() {
    let invitingMember = this.props.navigation.getParam("invitingMember");
    let verifiedName = this.props.navigation.getParam("verifiedName");
    if (!invitingMember || !verifiedName) {
      // Should not happen, but in case of bug we can safely navigate back to fill in missing info.
      console.warn(`Missing invitingMember or verifiedName: ${{invitingMember, verifiedName}}`)
      this.props.navigation.navigate(RouteName.OnboardingInvite);
      return <View />
    }

    return (
      <React.Fragment>
        <Text style={styles.text}>
          Please record a video with {invitingMember.fullName} to verify your
          identity.
        </Text>
        <Camera
          onVideoRecorded={uri => {
            this.props.navigation.navigate(RouteName.InviteVideoPreview, {
              videoUri: uri,
              invitingMember: invitingMember,
              verifiedName: verifiedName
            });
          }}
        />
        <Text style={styles.text}>Example of what to say:</Text>
        <Text style={styles.text}>
          {invitingMember.fullName}: "Hi, my name is {invitingMember.fullName},
          and I'm inviting {verifiedName} to Raha."
        </Text>
        <Text style={styles.text}>
          You: "My name is {verifiedName} and I'm joining Raha because I believe
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
