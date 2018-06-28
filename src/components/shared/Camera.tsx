/**
 * Renders the default Raha Camera component with video recording functionality that
 * requests necessary permissions from the user.
 *
 * The preview uses at 4:3 aspect ratio and attempts to keep that ratio. It records
 * in the lowest quality video available with a 4:3 aspect ratio with a 10 second cap.
 */

import * as React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { RNCamera, CameraType } from "react-native-camera";

import { Text } from "../display/Text";

type CameraProps = {
  onVideoRecorded: (uri: string) => any;
};

interface CameraState {
  type: keyof CameraType;
  isVideoRecording: boolean;
}

export class Camera extends React.Component<CameraProps, CameraState> {
  state: CameraState = {
    type: "front",
    isVideoRecording: false
  };

  // async componentWillMount() {
  //   await this.requestPermissions();
  // }

  // async requestPermissions() {
  //   const results = await Promise.all([
  //     Permissions.askAsync(Permissions.CAMERA),
  //     Permissions.askAsync(Permissions.AUDIO_RECORDING)
  //   ]);
  //   this.setState({
  //     hasCameraPermission: results[0].status === "granted",
  //     hasAudioRecordPermission: results[1].status === "granted"
  //   });
  // }

  startRecordVideo = async (camera: RNCamera) => {
    await new Promise(resolve =>
      this.setState({ isVideoRecording: true }, () => resolve())
    );

    const recordResponse = await camera.recordAsync({
      quality: RNCamera.Constants.VideoQuality["4:3"],
      maxDuration: 10 // seconds
    });

    this.setState({ isVideoRecording: false });
    this.props.onVideoRecorded(recordResponse.uri);
  };

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.camera}
          type={RNCamera.Constants.Type[this.state.type]}
          captureAudio
        >
          {({ camera, status }) => {
            if (status !== "READY") {
              return (
                <View>
                  <Text>
                    In order to verify your identity, you must record a video of
                    yourself. Please approve the permissions to continue.
                  </Text>
                  {/* TODO: figure out how to request permissions */}
                  {/* <Button
                    title="Approve Permissions"
                    onPress={() => {
                      this.requestPermissions();
                    }} */}
                </View>
              );
            }
            return (
              <View style={styles.cameraButtons}>
                {this.renderFlipButton()}
                {this.renderRecordButton(camera)}
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
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
        // Flip button will stop recording. To prevent user confusion, disable it.
        disabled={this.state.isVideoRecording}
      >
        <Text style={styles.buttonText}>Flip</Text>
      </TouchableOpacity>
    );
  };

  renderRecordButton = (camera: RNCamera) => {
    return (
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => {
          if (!this.state.isVideoRecording) {
            this.startRecordVideo(camera);
          } else {
            camera.stopRecording();
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
