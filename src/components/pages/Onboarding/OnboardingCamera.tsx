/**
 * Renders the onboarding camera preview component which allows a user to record their
 * identity verification video.
 */

import * as React from "react";
import { StyleSheet, View, TextStyle } from "react-native";
import { Camera } from "../../shared/Camera";
import { Text } from "../../shared/elements";
import { fonts } from "../../../helpers/fonts";
import { styles as sharedStyles } from "./styles";

type OwnProps = {
  verifiedFullName: string;
  inviterFullName?: string;
  onVideoRecorded: (videoUri: string) => void;
};
type OnboardingCameraProps = OwnProps;

export class OnboardingCamera extends React.Component<OnboardingCameraProps> {
  render() {
    return (
      <React.Fragment>
        <Text style={sharedStyles.paragraph}>
          {this.props.inviterFullName
            ? `Accept your invite from ${this.props.inviterFullName} by taking a video of yourself for your public profile!`
            : "Take a video of yourself for your public profile!"}
        </Text>
        <Camera
          onVideoRecorded={uri => {
            this.props.onVideoRecorded(uri);
          }}
        />
        <View>
          <Text style={sharedStyles.paragraph}>Let other people know your full name and why Raha interests you! Example:</Text>
          <Text style={sharedStyles.paragraph}>
            "My name is{" "}
            <Text style={[sharedStyles.paragraphText, styles.name]}>
              {this.props.verifiedFullName}
            </Text>{" "}
            and I'm joining Raha because I believe every life has value."
          </Text>
        </View>
      </React.Fragment>
    );
  }
}

const nameStyle: TextStyle = {
  ...fonts.Lato.Bold
};

const styles = StyleSheet.create({
  name: nameStyle
});
