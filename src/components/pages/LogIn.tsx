import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";

import {
  googleLogIn,
  facebookLogIn,
  AuthMethod
} from "../../store/actions/authentication";
import { RahaState } from "../../store";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  isLoggedIn: boolean;
  existingAuthMethod?: AuthMethod;
};

type DispatchProps = {
  googleLogIn: () => void;
  facebookLogIn: () => void;
};

type LogInProps = OwnProps & StateProps & DispatchProps;

class LogIn extends React.Component<LogInProps> {
  componentDidUpdate() {
    if (this.props.isLoggedIn) {
      this.props.navigation.navigate("Home");
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>This is the login page.</Text>
        <Button
          title="Cancel"
          onPress={() => this.props.navigation.navigate("Home")}
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
> = state => ({
  isLoggedIn:
    state.authentication.isLoaded && !!state.authentication.firebaseUser,
  existingAuthMethod: state.authentication.isLoaded
    ? undefined
    : state.authentication.existingAuthMethod
});

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  OwnProps
> = dispatch => ({
  googleLogIn: () => dispatch(googleLogIn()),
  facebookLogIn: () => dispatch(facebookLogIn())
});

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
