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
};

type InviteCameraProps = ReduxStateProps & OwnProps;

export class InviteCameraView extends React.Component<InviteCameraProps> {
  render() {
    return (
      <View style={sharedStyles.page}>
        <Text style={sharedStyles.paragraph}>
          {this.props.jointVideo
            ? "Record a video with the person you're inviting."
            : "Record a video of yourself inviting your friend to Raha."}
        </Text>
        <Camera
          onVideoRecorded={uri => {
            this.props.onVideoRecorded(uri);
          }}
        />
        <View style={styles.promptContainer}>
          <Text style={styles.promptHeader}>Example of what to say:</Text>
          <Text style={sharedStyles.paragraph}>
            "Hi, my name is{" "}
            <Text style={styles.name}>{this.props.ownFullName}</Text> and I'm
            inviting <Text style={styles.name}>Jane Doe</Text> to Raha."
          </Text>
          {this.props.jointVideo && (
            <Text style={sharedStyles.paragraph}>
              "My name is <Text style={styles.name}>Jane Doe</Text> and I'm
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
    ...fonts.Lato.Bold,
    ...fontSizes.medium
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
