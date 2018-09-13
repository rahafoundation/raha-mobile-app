import * as React from "react";
import { connect, MapStateToProps } from "react-redux";

import { auth } from "../firebaseInit";
import { logInAction, signedOutAction } from "../store/actions/authentication";
import { RNFirebase } from "react-native-firebase";
import { Dispatch } from "redux";
import DropdownAlert from "react-native-dropdownalert";
import { RahaState } from "../store";

type ReduxStateProps = {
  wasAutoLoggedIn?: boolean;
};
type OwnProps = { children: React.ReactNode };
type DispatchProps = {
  logIn: () => any;
  signOut: () => any;
};
type AuthManagerProps = OwnProps & DispatchProps & ReduxStateProps;

/**
 * Component that manages login state when the user is logged in automatically
 * by Firebase and notifies the user that happened.
 */
class AuthManagerComponent extends React.Component<AuthManagerProps> {
  private unsubscribe?: () => void;
  private dropdown: any;

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
      this.dropdown.alertWithType(
        "success",
        "Auto Logged In",
        "Google Play Services logged you in automatically."
      );
    }
  }

  public render() {
    return (
      <React.Fragment>
        {this.props.children}
        <DropdownAlert ref={(ref: any) => (this.dropdown = ref)} />
      </React.Fragment>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    logIn: () => dispatch(logInAction()),
    signOut: () => dispatch(signedOutAction())
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
