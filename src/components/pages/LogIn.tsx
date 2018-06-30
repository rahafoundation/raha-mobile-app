import * as React from "react";
import { StyleSheet, TextInput } from "react-native";
import { connect, MapDispatchToProps, MapStateToProps } from "react-redux";
import { NavigationScreenProp } from "react-navigation";

import {
  initiatePhoneLogIn,
  confirmPhoneLogIn,
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
  phoneLoginStatus?: RahaState["authentication"]["phoneLoginStatus"];
};

interface DispatchProps {
  initiatePhoneLogIn: (phoneNumber: string) => void;
  confirmPhoneLogIn: (confirmationCode: string) => void;
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
    phoneLoginStatus: state.authentication.phoneLoginStatus
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (
  dispatch: RahaThunkDispatch
) => ({
  initiatePhoneLogIn: (phoneNumber: string) =>
    dispatch(initiatePhoneLogIn(phoneNumber)),
  confirmPhoneLogIn: (confirmationCode: string) =>
    dispatch(confirmPhoneLogIn(confirmationCode)),
  signOut: () => dispatch(signOut())
});

export const LogIn = connect(
  mapStateToProps,
  mapDispatchToProps
)(LogInView);
