/**
 * Renders the default Raha Camera component with video recording functionality that
 * requests necessary permissions from the user.
 *
 * The preview uses at 4:3 aspect ratio and attempts to keep that ratio. It records
 * in the lowest quality video available with a 4:3 aspect ratio with a 10 second cap.
 */

import * as React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform
} from "react-native";
import { RNCamera, CameraType } from "react-native-camera";

import { Text, Button } from "./elements";

type CameraProps = {
  onVideoRecorded: (uri: string) => any;
};

interface CameraState {
  type: keyof CameraType;
  isVideoRecording: boolean;
  permissionsDenied: boolean;
}

export class Camera extends React.Component<CameraProps, CameraState> {
  state: CameraState = {
    type: "front",
    isVideoRecording: false,
    permissionsDenied: false
  };

  async componentWillMount() {
    await this.requestPermissions();
  }

  async requestPermissions() {
    if (Platform.OS === "ios") {
      return;
    }
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]);
      if (
        results[PermissionsAndroid.PERMISSIONS.CAMERA] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        this.setState({ permissionsDenied: false });
      } else {
        this.setState({ permissionsDenied: true });
      }
    } catch (exception) {
      console.error(exception);
    }
  }

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
        {this.state.permissionsDenied ? (
          <React.Fragment>
            <Text style={styles.permissionsText}>
              In order to verify your identity, you must record a video of
              yourself. Please approve the permissions to continue.
            </Text>
            <Button
              title="Approve Permissions"
              onPress={() => {
                this.requestPermissions();
              }}
            />
          </React.Fragment>
        ) : (
          <RNCamera
            style={styles.camera}
            type={RNCamera.Constants.Type[this.state.type]}
            captureAudio
          >
            {({ camera }) => {
              return (
                <View style={styles.cameraButtons}>
                  {this.renderFlipButton()}
                  {this.renderRecordButton(camera)}
                  <View style={{ flex: 1 }} />
                </View>
              );
            }}
          </RNCamera>
        )}
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
    width: "100%"
  },
  camera: {
    // ensure children are pushed to the bottom

    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",

    aspectRatio: 1,
    width: "100%"
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
  },
  permissionsText: {
    fontSize: 18,
    marginVertical: 4,
    marginHorizontal: 40,
    textAlign: "center"
  }
});
