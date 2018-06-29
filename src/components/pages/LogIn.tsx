import * as React from "react";
import { StyleSheet, TextInput } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { NavigationScreenProp } from "react-navigation";
import { GoogleSigninButton } from "react-native-google-signin";

import {
  googleLogIn,
  initiatePhoneLogIn,
  confirmPhoneLogIn,
  facebookLogIn,
  AuthMethod,
  signOut
} from "../../store/actions/authentication";
import { RahaState, RahaThunkDispatch } from "../../store";
import { RouteName } from "../shared/Navigation";
import { getLoggedInFirebaseUserId } from "../../store/selectors/authentication";
import { getMemberById } from "../../store/selectors/members";
import { Button, Container, Text } from "../shared/elements";

type OwnProps = {
  navigation: NavigationScreenProp<{}>;
};

type StateProps = {
  isLoggedIn: boolean;
  hasAccount: boolean;
  existingAuthMethod?: AuthMethod;
};

interface DispatchProps {
  googleLogIn: () => void;
  initiatePhoneLogIn: (phoneNumber: string) => void;
  confirmPhoneLogIn: (confirmationCode: string) => void;
  facebookLogIn: () => void;
  signOut: () => void;
}

type LogInProps = OwnProps & StateProps & DispatchProps;

interface LogInState {
  phoneNumber: string;
  confirmationCode: string;
}

class LogInView extends React.Component<LogInProps, LogInState> {
  componentDidUpdate() {
    if (!this.props.isLoggedIn) {
      return;
    }
    if (this.props.hasAccount) {
      this.props.navigation.navigate(RouteName.Home);
      return;
    }
    this.props.navigation.navigate(RouteName.OnboardingSplash);
  }

  private phoneNumberIsValid() {
    // TODO: something more rigorous than this
    return (
      this.state &&
      this.state.phoneNumber &&
      this.state.phoneNumber.match(/([+][0-9]+)?[0-9]+/)
    );
  }

  private confirmationCodeIsValid() {
    // TODO: something more rigorous than this
    return (
      this.state &&
      this.state.confirmationCode &&
      this.state.confirmationCode.match(/[0-9]{6}/)
    );
  }

  render() {
    return (
      <Container style={styles.container}>
        {this.props.existingAuthMethod && (
          <Text>
            It appears you have created an account with that email address
            before; please log in using a different method than{" "}
            {this.props.existingAuthMethod}.
          </Text>
        )}
        <GoogleSigninButton
          style={{ width: 230, height: 48 }}
          color={GoogleSigninButton.Color.Dark}
          size={GoogleSigninButton.Size.Standard}
          onPress={this.props.googleLogIn}
        />
        <Text>Input your phone number here</Text>
        <TextInput
          onChange={event =>
            this.setState({ phoneNumber: event.nativeEvent.text })
          }
          placeholder={"Your phone number"}
        />
        <Button
          title="Log in by SMS"
          onPress={() => this.props.initiatePhoneLogIn(this.state.phoneNumber)}
          disabled={!this.phoneNumberIsValid()}
        />
        <Text>Input your confirmation code here</Text>
        <TextInput
          onChange={event =>
            this.setState({ confirmationCode: event.nativeEvent.text })
          }
          placeholder={"verification code"}
        />
        <Button
          title="Submit verification code"
          onPress={() =>
            this.props.confirmPhoneLogIn(this.state.confirmationCode)
          }
          disabled={!this.confirmationCodeIsValid()}
        />
        {/* <Button
          title="Log in with Facebook"
          onPress={this.props.facebookLogIn}
        /> */}
        <Button title="Clear" onPress={this.props.signOut} />
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  }
});

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  RahaState
> = state => {
  const isLoggedIn =
    state.authentication.isLoaded && state.authentication.isLoggedIn;
  const loggedInMemberId = getLoggedInFirebaseUserId(state);
  const hasAccount =
    isLoggedIn &&
    !!loggedInMemberId &&
    getMemberById(state, loggedInMemberId) !== undefined;
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
  initiatePhoneLogIn: (phoneNumber: string) =>
    dispatch(initiatePhoneLogIn(phoneNumber)),
  confirmPhoneLogIn: (confirmationCode: string) =>
    dispatch(confirmPhoneLogIn(confirmationCode)),
  facebookLogIn: () => dispatch(facebookLogIn()),
  signOut: () => dispatch(signOut())
});

export const LogIn = connect(
  mapStateToProps,
  mapDispatchToProps
)(LogInView);
