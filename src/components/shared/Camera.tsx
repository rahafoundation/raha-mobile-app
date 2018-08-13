/**
 * Renders the default Raha Camera component with video recording functionality that
 * requests necessary permissions from the user.
 *
 * The preview uses at 4:3 aspect ratio and attempts to keep that ratio. It records
 * in the lowest quality video available with a 4:3 aspect ratio with a 10 second cap.
 */

import * as React from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { RNCamera, CameraType } from "react-native-camera";

import { Text } from "./elements";

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
            if (status === "NOT_AUTHORIZED") {
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
                <View style={{ flex: 1 }} />
              </View>
            );
          }}
        </RNCamera>
      </View>
    );
  }

  renderFlipButton = () => {
    const opacity = { opacity: this.state.isVideoRecording ? 0.5 : 1 };
    return (
      <TouchableOpacity
        style={[styles.flipButton, opacity]}
        onPress={() => {
          this.setState({
            type: this.state.type === "back" ? "front" : "back"
          });
        }}
        // Flip button will stop recording. To prevent user confusion, disable it.
        disabled={this.state.isVideoRecording}
      >
        <Image
          style={{
            flex: 1,
            width: 40
          }}
          resizeMode="contain"
          source={require("../../assets/img/flip.png")}
        />
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
        <Image
          style={{
            flex: 1,
            width: 80
          }}
          resizeMode="contain"
          source={
            this.state.isVideoRecording
              ? require("../../assets/img/record_stop.png")
              : require("../../assets/img/record.png")
          }
        />
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  errorText: {
    color: "white"
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  camera: {
    flex: 1,
    aspectRatio: 3 / 4,
    flexDirection: "column",
    justifyContent: "flex-end"
  },
  cameraButtons: {
    height: "25%",
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  flipButton: {
    flex: 1,
    alignItems: "center"
  },
  recordButton: {
    flex: 1,
    alignItems: "center"
  },
  buttonText: {
    fontSize: 18,
    marginBottom: 10,
    color: "white",
    textAlign: "center"
  }
});
