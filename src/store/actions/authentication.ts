import { Action } from "redux";
import firebase from "firebase";
import { ActionCreator } from "redux";

import { AsyncActionCreator } from "./types";
import { Google, Facebook } from "expo";
import { auth } from "../../firebaseInit";
import { AppState } from "..";

const CONFIG = require("../../data/config.json");

const FIREBASE_EXISTING_CREDENTIAL_ERROR_CODE =
  "auth/account-exists-with-different-credential";

export enum AuthMethod {
  GOOGLE = "Google",
  FACEBOOK = "Facebook"
}

export const enum AuthenticationActionType {
  SET_FIREBASE_USER = "AUTHENTICATION.SET_FIREBASE_USER",
  EXISTING_CREDENTIAL = "AUTHENTICATION.EXISTING_CREDENTIAL"
}

export interface SetFirebaseUserAction {
  type: AuthenticationActionType.SET_FIREBASE_USER;
  firebaseUser: firebase.User;
}

export interface ExistingCredentialAction {
  type: AuthenticationActionType.EXISTING_CREDENTIAL;
  authMethod: AuthMethod;
}

export type AuthenticationAction =
  | ExistingCredentialAction
  | SetFirebaseUserAction;

const setFirebaseUserAction = (firebaseUser: firebase.User) => ({
  type: AuthenticationActionType.SET_FIREBASE_USER,
  firebaseUser
});

const existingCredentialAction = (authMethod: AuthMethod) => ({
  type: AuthenticationActionType.EXISTING_CREDENTIAL,
  authMethod
});

/**
 * TODO: if we make actions general, figure out how to distinguish between
 * mobile-specific login methods like this vs platform-independent ones.
 */
export const googleLogIn: AsyncActionCreator = () => async dispatch => {
  const {
    iosClientId,
    iosStandaloneAppClientId,
    androidClientId,
    androidStandaloneAppClientId
  } = CONFIG.google;

  const googleData = await Google.logInAsync({
    iosClientId,
    iosStandaloneAppClientId,
    androidClientId,
    androidStandaloneAppClientId,
    scopes: ["profile", "email"]
  });

  if (googleData.type !== "success") {
    // TODO: dispatch something that says it failed?
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
    dispatch(setFirebaseUserAction(authData.user));
  } catch (error) {
    if (error.code === FIREBASE_EXISTING_CREDENTIAL_ERROR_CODE) {
      dispatch(existingCredentialAction(AuthMethod.GOOGLE));
      return;
    }
    // TODO: deal with error
    throw error;
  }
};

export const facebookLogIn: AsyncActionCreator = () => async dispatch => {
  const facebookData = await Facebook.logInWithReadPermissionsAsync(
    CONFIG.facebook.appId,
    {
      permissions: ["public_profile"]
    }
  );

  if (facebookData.type !== "success" || !facebookData.token) {
    // TODO: dispatch something that says it failed?
    return;
  }

  try {
    const credential = firebase.auth.FacebookAuthProvider.credential(
      facebookData.token
    );

    const authData = await auth.signInAndRetrieveDataWithCredential(credential);
    dispatch(setFirebaseUserAction(authData.user));
  } catch (error) {
    if (error.code === FIREBASE_EXISTING_CREDENTIAL_ERROR_CODE) {
      dispatch(existingCredentialAction(AuthMethod.FACEBOOK));
      return;
    }
    // TODO: handle error;
    throw error;
  }
};
