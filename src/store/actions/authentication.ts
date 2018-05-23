import { Action } from "redux";
import firebase from "firebase";
import { ActionCreator } from "redux";
import { NavigationActions } from "react-navigation";

import { AsyncActionCreator } from "./types";
import { Google } from "expo";
import { auth } from "../../firebaseInit";

export const SET_FIREBASE_USER = "SET_FIREBASE_USER";

export interface SetFirebaseUserAction extends Action {
  type: typeof SET_FIREBASE_USER;
  firebaseUser: firebase.User;
}

const setFirebaseUser: ActionCreator<SetFirebaseUserAction> = (
  firebaseUser: firebase.User
) => ({
  type: SET_FIREBASE_USER,
  firebaseUser
});

export const authSetFirebaseUser: AsyncActionCreator = (
  firebaseUser: firebase.User
) => dispatch => {
  dispatch(setFirebaseUser(firebaseUser));
};

/**
 * TODO: if we make actions general, figure out how to distinguish between
 * mobile-specific login methods like this vs platform-independent ones.
 */
export const googleLogIn: AsyncActionCreator = () => async dispatch => {
  const googleData = await Google.logInAsync({
    iosClientId:
      "1000788606610-poko6usql5gpdaq9bl0h3ljac8lnpprr.apps.googleusercontent.com",
    iosStandaloneAppClientId:
      "1000788606610-31qfhcdqisk618gndrhacfq1mvc5p7cc.apps.googleusercontent.com",
    androidClientId:
      "1000788606610-off9qgir4lgtgct5lrod948e4k28egfc.apps.googleusercontent.com",
    androidStandaloneAppClientId:
      "1000788606610-3si004egrf47c9em0hpn255v8kl8ebau.apps.googleusercontent.com"
  });
  if (googleData.type === "cancel") {
    // TODO: dispatch something that says it was cancelled?
    return;
  }
  try {
    // Create a new Firebase credential with the token
    const credential = firebase.auth.GoogleAuthProvider.credential(
      googleData.idToken,
      googleData.accessToken
    );

    // Login with the credential
    const authData = await auth.signInAndRetrieveDataWithCredential(credential);
    dispatch(setFirebaseUser(authData.user));
  } catch (error) {
    const { code, message } = error;
  }
};
