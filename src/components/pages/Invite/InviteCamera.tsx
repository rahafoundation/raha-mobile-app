/**
 * Renders the invite camera preview screen which allows a user to record a video with the invitee
 * from their own phone.
 */

import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Camera } from "../../shared/Camera";
import { Text } from "../../shared/elements";
import { getLoggedInMember } from "../../../store/selectors/authentication";
import { RahaState } from "../../../store";
import { MapStateToProps, connect } from "react-redux";
import { styles as sharedStyles } from "./styles";
import { fonts, fontSizes } from "../../../helpers/fonts";

type ReduxStateProps = {
  ownFullName: string;
};

type OwnProps = {
  onVideoRecorded: (videoUri: string) => void;
  jointVideo: boolean;
  onBack: () => void;
};

type InviteCameraProps = ReduxStateProps & OwnProps;

export class InviteCameraView extends React.Component<InviteCameraProps> {
  render() {
    const speechStyle = this.props.jointVideo ? styles.speech : sharedStyles.paragraph;
    const nameStyle = [styles.name, this.props.jointVideo ? fontSizes.small : fontSizes.medium];
    return (
      <View style={sharedStyles.page}>
        <Text style={sharedStyles.back} onPress={this.props.onBack}>
          Back
        </Text>
        <Camera
          onVideoRecorded={uri => {
            this.props.onVideoRecorded(uri);
          }}
        />
        <View style={styles.promptContainer}>
          <Text style={styles.promptHeader}>
          {this.props.jointVideo ? "Each say your full name, for example" : "Example of what to say"}:
          </Text>
          <Text style={speechStyle}>
            "Hi, my name is{" "}
            <Text style={nameStyle}>{this.props.ownFullName}</Text> and I'm
            inviting <Text style={nameStyle}>Jane Doe</Text> to Raha."
          </Text>
          {this.props.jointVideo && (
            <Text style={speechStyle}>
              "My name is <Text style={nameStyle}>Jane Doe</Text> and I'm
              joining Raha because I believe every life has value."
            </Text>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  name: {
    ...fonts.Lato.Bold
  },
  promptHeader: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: "center"
  },
  promptContainer: {
    padding: 8
  },
  speech: {
    ...fontSizes.small,
    marginVertical: 4,
    marginHorizontal: 20
  }
});

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  if (!loggedInMember) {
    console.warn("Missing logged in member while trying to invite");
  }
  // Should never be undefined if you're never logged in, but if you are magically, you get to be Midoriya!
  return {
    ownFullName: loggedInMember
      ? loggedInMember.get("fullName")
      : "Izuku Midoriya"
  };
};

export const InviteCamera = connect(mapStateToProps)(InviteCameraView);
