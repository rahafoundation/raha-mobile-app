import * as React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Camera, Permissions } from "expo";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import {
  googleLogIn,
  facebookLogIn,
  AuthMethod
} from "../../store/actions/authentication";
import { RahaState } from "../../store";

type OwnProps = {};

type StateProps = {};

type OnboardingCameraProps = OwnProps & StateProps;

class OnboardingCamera extends React.Component<OnboardingCameraProps> {
  state = {
    hasCameraPermission: null,
    type: "front"
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "row"
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: "flex-end",
                  alignItems: "center"
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === "back" ? "front" : "back"
                  });
                }}
              >
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                >
                  {" "}
                  Flip{" "}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  container: {
    minHeight: "100%",
    flex: 1,
    backgroundColor: "#ddd"
  }
});

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const { firebaseUser } = state.authentication;
  return {
    loggedInUserId: firebaseUser ? firebaseUser.uid : undefined
  };
};

export default connect(mapStateToProps)(OnboardingCamera);
