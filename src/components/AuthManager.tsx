import * as React from "react";
import { connect, MapStateToProps } from "react-redux";
import { Dispatch } from "redux";

import { auth } from "../firebaseInit";
import { logInAction, signedOutAction } from "../store/actions/authentication";
import { RNFirebase } from "react-native-firebase";
import { RahaState } from "../store";
import { displayDropdownMessage } from "../store/actions/dropdown";
import { DropdownType } from "../store/reducers/dropdown";

type ReduxStateProps = {
  wasAutoLoggedIn?: boolean;
};
type OwnProps = { children: React.ReactNode };
type DispatchProps = {
  logIn: () => any;
  signOut: () => any;
  displayDropdownMessage: (
    type: DropdownType,
    title: string,
    message: string
  ) => void;
};
type AuthManagerProps = OwnProps & DispatchProps & ReduxStateProps;

/**
 * Component that manages login state when the user is logged in by Firebase and
 * notifies the user if auto-login happened (Android only).
 */
class AuthManagerComponent extends React.Component<AuthManagerProps> {
  private unsubscribe?: () => void;

  public constructor(props: AuthManagerProps) {
    super(props);
    this.unsubscribe = undefined;
  }

  public componentWillMount() {
    this.unsubscribe = auth.onAuthStateChanged((user: RNFirebase.User) => {
      if (user) {
        this.props.logIn();
      } else {
        this.props.signOut();
      }
    });
  }

  public componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  public componentDidUpdate() {
    if (this.props.wasAutoLoggedIn) {
      this.props.displayDropdownMessage(
        DropdownType.SUCCESS,
        "Auto Logged In",
        "Google Play Services logged you in automatically."
      );
    }
  }

  public render() {
    return this.props.children;
  }
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    logIn: () => dispatch(logInAction()),
    signOut: () => dispatch(signedOutAction()),
    displayDropdownMessage: (
      type: DropdownType,
      title: string,
      message: string
    ) => dispatch(displayDropdownMessage(type, title, message))
  };
}

const mapStateToProps: MapStateToProps<
  ReduxStateProps,
  OwnProps,
  RahaState
> = state => {
  return {
    wasAutoLoggedIn: state.authentication.wasAutoLoggedIn
  };
};

export const AuthManager = connect(
  mapStateToProps,
  mapDispatchToProps
)(AuthManagerComponent);
