/**
 * Renders the onboarding camera preview screen which allows a user to record their
 * identity verification video.
 */

import * as React from "react";
import { StyleSheet, View, TextStyle } from "react-native";
import { Camera } from "../../shared/Camera";
import { Text, IndependentPageContainer } from "../../shared/elements";
import { fontSizes, fonts } from "../../../helpers/fonts";
import { styles as sharedStyles } from "./styles";

type OwnProps = {
  verifiedFullName: string;
  onVideoRecorded: (videoUri: string) => void;
};
type OnboardingCameraProps = OwnProps;

export class OnboardingCamera extends React.Component<OnboardingCameraProps> {
  render() {
    return (
      <IndependentPageContainer>
        <View style={sharedStyles.page}>
          <Text style={sharedStyles.paragraph}>
            Please record a video of yourself stating your identity.
          </Text>
          <Camera
            onVideoRecorded={uri => {
              this.props.onVideoRecorded(uri);
            }}
          />
          <View>
            <Text style={sharedStyles.paragraph}>Example of what to say:</Text>
            <Text style={sharedStyles.paragraph}>
              "My name is{" "}
              <Text style={[sharedStyles.paragraphText, styles.name]}>
                {this.props.verifiedFullName}
              </Text>{" "}
              and I'm joining Raha because I believe every life has value."
            </Text>
          </View>
        </View>
      </IndependentPageContainer>
    );
  }
}

const nameStyle: TextStyle = {
  ...fonts.Lato.Bold
};

const styles = StyleSheet.create({
  name: nameStyle
});
