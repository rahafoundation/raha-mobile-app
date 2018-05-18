import { Action } from "redux";
import firebase from "firebase";
import { ActionCreator } from "redux";

// TODO: this is native-specific, if we're splitting out the redux store,
// figure out how to pull out platform-independent stuff like this.
import { Google } from "expo";

import { AsyncActionCreator } from "./types";

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
  const googleData = await Google.logInAsync({});
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
    const firebaseUser = await firebase.auth().signInWithCredential(credential);
    dispatch(setFirebaseUser(firebaseUser));
  } catch (error) {
    const { code, message } = error;
  }
};
