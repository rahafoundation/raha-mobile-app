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
import OpenAppSettings from "react-native-app-settings";

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
  camera: RNCamera | null;

  constructor(props: CameraProps) {
    super(props);
    this.camera = null;
  }

  async UNSAFE_componentWillMount() {
    // iOS will prompt when the component is access for the first time.
    await this.requestPermissionsAndroid();
  }

  async requestPermissionsAndroid() {
    if (Platform.OS === "android") {
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
  }

  requestPermissions = async () => {
    if (Platform.OS === "ios") {
      // iOS doesn't allow us to reprompt the user from the app, so send them to
      // our app's settings page.
      OpenAppSettings.open();
    } else {
      this.requestPermissionsAndroid();
    }
  };

  startRecordVideo = async (camera: RNCamera) => {
    await new Promise(resolve =>
      this.setState({ isVideoRecording: true }, () => resolve())
    );

    const recordResponse = await camera.recordAsync({
      quality: RNCamera.Constants.VideoQuality["4:3"],
      maxDuration: 15 // seconds
    });

    this.setState({ isVideoRecording: false });
    this.props.onVideoRecorded(recordResponse.uri);
  };

  renderNotAuthorizedView = () => {
    return (
      <View>
        <Text style={styles.permissionsText}>
          In order to verify your identity, you must record a video of yourself.
          Please approve the camera and microphone permissions to continue.
        </Text>
        <Button
          title="Approve Permissions"
          onPress={() => {
            this.requestPermissions();
          }}
        />
      </View>
    );
  };

  renderPendingView = () => {
    return <View />;
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.permissionsDenied ? (
          this.renderNotAuthorizedView()
        ) : (
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.camera}
            type={RNCamera.Constants.Type[this.state.type]}
            captureAudio
            notAuthorizedView={this.renderNotAuthorizedView()}
            pendingAuthorizationView={this.renderPendingView()}
          >
            <View style={styles.cameraButtons}>
              {this.renderFlipButton()}
              {this.renderRecordButton()}
              <View style={{ flex: 1 }} />
            </View>
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

  renderRecordButton = () => {
    return (
      <TouchableOpacity
        style={styles.recordButton}
        onPress={() => {
          if (this.camera) {
            if (!this.state.isVideoRecording) {
              this.startRecordVideo(this.camera);
            } else {
              this.camera.stopRecording();
            }
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
    width: "100%",
    overflow: "hidden"
  },
  camera: {
    // ensure buttons are pushed to the bottom
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
