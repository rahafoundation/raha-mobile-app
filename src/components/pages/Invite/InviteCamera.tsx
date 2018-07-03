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

type ReduxStateProps = {
  ownFullName: string;
};

type OwnProps = {
  onVideoRecorded: (videoUri: string) => void;
};

type InviteCameraProps = ReduxStateProps & OwnProps;

export class InviteCameraView extends React.Component<InviteCameraProps> {
  render() {
    return (
      <React.Fragment>
        <Text style={styles.headerText}>
          Please record a video with the person you're inviting to verify their
          identity.
        </Text>
        <Camera
          onVideoRecorded={uri => {
            this.props.onVideoRecorded(uri);
          }}
        />
        <View style={styles.promptContainer}>
          <Text style={styles.promptHeader}>Example of what to say:</Text>
          <Text style={styles.text}>
            {`"Hi, my name is ${
              this.props.ownFullName
            } and I'm inviting Jane Doe to Raha."`}
          </Text>
          <Text style={styles.text}>
            "My name is Jane Doe and I'm joining Raha because I believe every
            life has value."
          </Text>
        </View>
      </React.Fragment>
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
    margin: 12
  }
});

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  const loggedInMember = getLoggedInMember(state);
  // Should never be undefined if you're never logged in, but if you are magically, you get to be Midoriya!
  return {
    ownFullName: loggedInMember ? loggedInMember.fullName : "Izuku Midoriya"
  };
};

export const InviteCamera = connect(mapStateToProps)(InviteCameraView);
