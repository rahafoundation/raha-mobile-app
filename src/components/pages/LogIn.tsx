import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";

import {
  googleLogIn,
  facebookLogIn,
  AuthMethod
} from "../../store/actions/authentication";
import { RahaState, RahaThunkDispatch } from "../../store";
import { RouteName } from "../../../App";
import { getMembersByIds } from "../../store/selectors/members";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  isLoggedIn: boolean;
  hasAccount: boolean;
  existingAuthMethod?: AuthMethod;
};

type DispatchProps = {
  googleLogIn: () => void;
  facebookLogIn: () => void;
};

type LogInProps = OwnProps & StateProps & DispatchProps;

class LogInView extends React.Component<LogInProps> {
  componentDidUpdate() {
    if (!this.props.isLoggedIn) {
      return;
    }
    if (this.props.hasAccount) {
      this.props.navigation.navigate(RouteName.Home);
      return;
    }
    this.props.navigation.navigate(RouteName.Onboarding);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>This is the login page.</Text>
        <Button
          title="Cancel"
          onPress={() => this.props.navigation.navigate(RouteName.Home)}
        />
        {this.props.existingAuthMethod && (
          <Text>
            It appears you have created an account with that email address
            before; please log in using a different method than{" "}
            {this.props.existingAuthMethod}.
          </Text>
        )}
        <Button title="Log in with Google" onPress={this.props.googleLogIn} />
        <Button
          title="Log in with Facebook"
          onPress={this.props.facebookLogIn}
        />
        <Button
          title="Sign Up"
          onPress={() => this.props.navigation.navigate("Onboarding")}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const firebaseUser = state.authentication.firebaseUser;
  const isLoggedIn =
    state.authentication.isLoaded && !!state.authentication.firebaseUser;
  const hasAccount =
    isLoggedIn &&
    !!state.authentication.firebaseUser &&
    getMembersByIds(state, [state.authentication.firebaseUser.uid])[0] !==
      undefined;
  return {
    isLoggedIn,
    hasAccount,
    existingAuthMethod: state.authentication.isLoaded
      ? undefined
      : state.authentication.existingAuthMethod
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: RahaThunkDispatch
) => ({
  googleLogIn: () => dispatch(googleLogIn()),
  facebookLogIn: () => dispatch(facebookLogIn())
});

export const LogIn = connect(
  mapStateToProps,
  mapDispatchToProps
)(LogInView);
