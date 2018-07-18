import * as React from "react";
import { connect } from "react-redux";

import { auth } from "../firebaseInit";
import { logInAction, signedOutAction } from "../store/actions/authentication";
import { RNFirebase } from "react-native-firebase";
import { Dispatch } from "redux";

type OwnProps = { children: React.ReactNode };
type DispatchProps = {
  logIn: () => any;
  signOut: () => any;
};
type Props = OwnProps & DispatchProps;

class AuthManagerComponent extends React.Component<Props> {
  private unsubscribe?: () => void;
  public constructor(props: Props) {
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

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    logIn: () => dispatch(logInAction()),
    signOut: () => dispatch(signedOutAction())
  };
}

export const AuthManager = connect(
  undefined,
  mapDispatchToProps
)(AuthManagerComponent);
