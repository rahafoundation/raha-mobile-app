import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { auth } from "../firebaseInit";
import { logInAction, signedOutAction } from "../store/actions/authentication";
import { RNFirebase } from "react-native-firebase";

type ReduxStateProps = {};
type OwnProps = { children: React.ReactNode };
type DispatchProps = {
  logIn: () => any;
  signOut: () => any;
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

  public render() {
    return this.props.children;
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    logIn: () => dispatch(logInAction()),
    signOut: () => dispatch(signedOutAction())
  };
}

export const AuthManager = connect(
  undefined,
  mapDispatchToProps
)(AuthManagerComponent);
