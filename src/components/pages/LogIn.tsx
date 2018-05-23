import * as React from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";

import { googleLogIn } from "../../store/actions/authentication";
import { AppState } from "../../store";

type OwnProps = {
  navigation: any;
};

type StateProps = {
  isLoggedIn: boolean;
};

type DispatchProps = {
  googleLogIn: () => void;
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
        <Button title="Log in with Google" onPress={this.props.googleLogIn} />
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
  AppState
> = state => ({
  isLoggedIn:
    state.authentication.isLoaded && !!state.authentication.firebaseUser
});

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  OwnProps
> = dispatch => ({
  googleLogIn: () => dispatch(googleLogIn())
});

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
