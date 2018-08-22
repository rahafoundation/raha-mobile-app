/**
 * Renders the invite camera preview screen which allows a user to record a video with the invitee
 * from their own phone.
 */

import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Camera } from "../../shared/Camera";
import { Text } from "../../shared/elements";

type OwnProps = {
  ownFullName: string;
  toFullName: string;
  onVideoRecorded: (videoUri: string) => void;
};

export class VerifyCamera extends React.Component<OwnProps> {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text style={styles.headerText}>
          Record a video of yourself verifying your friend's identity.
        </Text>
        <Camera
          onVideoRecorded={uri => {
            this.props.onVideoRecorded(uri);
          }}
        />
        <View style={styles.promptContainer}>
          <Text style={styles.promptHeader}>Example of what to say:</Text>
          <Text style={styles.text}>
            "Hi, my name is{" "}
            <Text style={styles.name}>{this.props.ownFullName}</Text> and I'm
            verifying that this account belongs to{" "}
            <Text style={styles.name}>{this.props.toFullName}</Text>
            ."
          </Text>
        </View>
      </View>
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
  name: {
    fontWeight: "bold"
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
