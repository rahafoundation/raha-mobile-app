import * as React from "react";
import { StyleSheet, View } from "react-native";
import { RNCamera } from "react-native-camera";
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

const OnboardingCamera: React.StatelessComponent<
  OnboardingCameraProps
> = props => {
  return <View style={styles.container} />;
};

const styles = StyleSheet.create({
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
