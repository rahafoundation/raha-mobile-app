import { Action } from "redux";
import firebase from "firebase";
import { ActionCreator } from "redux";

import { AsyncActionCreator } from "./";
import { Google, Facebook } from "expo";
import { auth } from "../../firebaseInit";
import { RahaState } from "..";

import { config } from "../../data/config";
import { ThunkDispatch } from "redux-thunk";

const FIREBASE_EXISTING_CREDENTIAL_ERROR_CODE =
  "auth/account-exists-with-different-credential";

export enum AuthMethod {
  GOOGLE = "Google",
  FACEBOOK = "Facebook"
}

export const enum AuthenticationActionType {
  LOG_IN = "AUTHENTICATION.LOG_IN",
  EXISTING_CREDENTIAL = "AUTHENTICATION.EXISTING_CREDENTIAL",
  SIGN_OUT = "AUTHENTICATION.SIGN_OUT",
  SIGNED_OUT = "AUTHENTICATION.SIGNED_OUT"
}

export interface LogInAction {
  type: AuthenticationActionType.LOG_IN;
}

export interface ExistingCredentialAction {
  type: AuthenticationActionType.EXISTING_CREDENTIAL;
  authMethod: AuthMethod;
}

export interface SignOutAction {
  type: AuthenticationActionType.SIGN_OUT;
}
export interface SignedOutAction {
  type: AuthenticationActionType.SIGNED_OUT;
}

export type AuthenticationAction =
  | ExistingCredentialAction
  | LogInAction
  | SignOutAction
  | SignedOutAction;

export const logInAction = (): LogInAction => ({
  type: AuthenticationActionType.LOG_IN
});

const existingCredentialAction = (
  authMethod: AuthMethod
): ExistingCredentialAction => ({
  type: AuthenticationActionType.EXISTING_CREDENTIAL,
  authMethod
});

const signOutAction = (): SignOutAction => ({
  type: AuthenticationActionType.SIGN_OUT
});

export const signedOutAction = (): SignedOutAction => ({
  type: AuthenticationActionType.SIGNED_OUT
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
  } = config.google;

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
    await auth.signInAndRetrieveDataWithCredential(credential);
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
    config.facebook.appId,
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

    await auth.signInAndRetrieveDataWithCredential(credential);
  } catch (error) {
    if (error.code === FIREBASE_EXISTING_CREDENTIAL_ERROR_CODE) {
      dispatch(existingCredentialAction(AuthMethod.FACEBOOK));
      return;
    }
    // TODO: handle error;
    throw error;
  }
};

export const signOut: AsyncActionCreator = () => async dispatch => {
  await auth.signOut(); // TODO handle error
  dispatch(signOutAction());
};
