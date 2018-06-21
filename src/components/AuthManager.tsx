import * as firebase from "firebase";
import * as React from "react";
import { connect, Dispatch } from "react-redux";

import { auth } from "../firebaseInit";
import { logInAction, signedOutAction } from "../store/actions/authentication";

type OwnProps = { children: React.ReactNode };
type DispatchProps = {
  logIn: () => any;
  signOut: () => any;
};
type Props = OwnProps & DispatchProps;

class AuthManagerComponent extends React.Component<Props> {
  private unsubscribe: undefined | firebase.Unsubscribe;
  public constructor(props: Props) {
    super(props);
    this.unsubscribe = undefined;
  }

  public componentWillMount() {
    this.unsubscribe = auth.onAuthStateChanged(user => {
      console.log("AuthStateChanged");
      if (user) {
        console.log("SignedIn");
        this.props.logIn();
      } else {
        console.log("SignedOut");
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
