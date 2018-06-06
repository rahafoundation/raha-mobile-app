/**
 * Renders the default Raha Camera component with video recording functionality that
 * requests necessary permissions from the user.
 *
 * The preview uses at 4:3 aspect ratio and attempts to keep that ratio. It records
 * in the lowest quality video available with a 4:3 aspect ratio with a 10 second cap.
 */

import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";
import { Camera as ExpoCamera, Permissions, CameraObject } from "expo";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import {
  googleLogIn,
  facebookLogIn,
  AuthMethod
} from "../../store/actions/authentication";
import { RahaState } from "../../store";
import { ENGINE_METHOD_DIGESTS } from "constants";
import { Record } from "immutable";

type CameraProps = {
  onVideoRecorded: (uri: string) => any;
};

interface CameraState {
  hasCameraPermission?: boolean;
  hasAudioRecordPermission?: boolean;
  type: string;
  isVideoRecording: boolean;
}

class Camera extends React.Component<CameraProps, CameraState> {
  private cameraRef?: React.RefObject<CameraObject & ExpoCamera>;

  state = {
    hasCameraPermission: undefined,
    hasAudioRecordPermission: undefined,
    type: "front",
    isVideoRecording: false
  };

  constructor(props: CameraProps) {
    super(props);
    this.cameraRef = React.createRef();
  }

  async componentWillMount() {
    await this.requestPermissions();
  }

  async requestPermissions() {
    const results = await Promise.all([
      Permissions.askAsync(Permissions.CAMERA),
      Permissions.askAsync(Permissions.AUDIO_RECORDING)
    ]);
    this.setState({
      hasCameraPermission: results[0].status === "granted",
      hasAudioRecordPermission: results[1].status === "granted"
    });
  }

  render() {
    if (
      !this.state.hasCameraPermission ||
      !this.state.hasAudioRecordPermission
    ) {
      return (
        <View>
          <Text>
            In order to verify your identity, you must record a video of
            yourself. Please approve the permissions to continue.
          </Text>
          <Button
            title="Approve Permissions"
            onPress={() => {
              this.requestPermissions();
            }}
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <ExpoCamera
            style={styles.camera}
            type={this.state.type}
            ref={this.cameraRef}
          >
            <View style={styles.cameraButtons}>
              {this.renderFlipButton()}
              {this.renderRecordButton()}
            </View>
          </ExpoCamera>
        </View>
      );
    }
  }

  renderFlipButton = () => {
    return (
      <TouchableOpacity
        style={styles.flipButton}
        onPress={() => {
          this.setState({
            type: this.state.type === "back" ? "front" : "back"
          });
        }}
      >
        <Text style={styles.buttonText}>Flip</Text>
      </TouchableOpacity>
    );
  };

  startRecordVideo = (camera: CameraObject) => {
    camera
      .recordAsync({
        // quality: Camera.Constants.VideoQuality['720p'],
        maxDuration: 10 // seconds
      })
      .then(({ uri }) => {
        this.setState({
          isVideoRecording: false
        });
        this.props.onVideoRecorded(uri);
      })
      .catch(reason => {
        // TODO: Handle error, toast a message?
      });

    this.setState({
      isVideoRecording: true
    });
  };

  renderRecordButton = () => {
    return (
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => {
          if (this.cameraRef && this.cameraRef.current) {
            if (!this.state.isVideoRecording) {
              this.startRecordVideo(this.cameraRef.current);
            } else {
              this.cameraRef.current.stopRecording();
            }
          }
        }}
      >
        <Text style={styles.buttonText}>
          {this.state.isVideoRecording ? "Stop" : "Record"}
        </Text>
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  container: {
    backgroundColor: "#ddd",
    flex: 1
  },
  camera: {
    width: "100%",
    aspectRatio: 3 / 4
  },
  cameraButtons: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "flex-end"
  },
  flipButton: {
    flex: 0.2
  },
  recordButton: {
    flex: 1
  },
  buttonText: {
    fontSize: 18,
    marginBottom: 10,
    color: "white",
    textAlign: "center"
  }
});

export default Camera;
