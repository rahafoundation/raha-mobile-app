import firebase from "firebase";
import RNFirebase, { RNFirebase as FirebaseTypes } from "react-native-firebase";
import { GoogleSignin } from "react-native-google-signin";

import { AsyncActionCreator } from "./";
import { auth, webAuth } from "../../firebaseInit";

import { config } from "../../data/config";

const FIREBASE_EXISTING_CREDENTIAL_ERROR_CODE =
  "auth/account-exists-with-different-credential";

export enum AuthMethod {
  GOOGLE = "Google",
  FACEBOOK = "Facebook",
  PHONE = "phone"
}

export const enum AuthenticationActionType {
  LOG_IN = "AUTHENTICATION.LOG_IN",
  EXISTING_CREDENTIAL = "AUTHENTICATION.EXISTING_CREDENTIAL",
  SIGN_OUT = "AUTHENTICATION.SIGN_OUT",
  SIGNED_OUT = "AUTHENTICATION.SIGNED_OUT",
  PHONE_LOGIN_INITIATED = "AUTHENTICATION.PHONE_LOGIN_INITIATED",
  PHONE_LOGIN_PENDING_CONFIRMATION = "AUTHENTICATION.PHONE_LOGIN_PENDING_CONFIRMATION",
  PHONE_LOGIN_FAILED = "AUTHENTICATION.PHONE_LOGIN_FAILED",
  PHONE_LOGIN_COMPLETE = "AUTHENTICATION.PHONE_LOGIN_COMPLETE",
  PHONE_LOGIN_CANCELED = "AUTHENTICATION.PHONE_LOGIN_CANCELED"
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

export interface PhoneLoginAction {
  type:
    | AuthenticationActionType.PHONE_LOGIN_CANCELED
    | AuthenticationActionType.PHONE_LOGIN_COMPLETE
    | AuthenticationActionType.PHONE_LOGIN_FAILED
    | AuthenticationActionType.PHONE_LOGIN_PENDING_CONFIRMATION
    | AuthenticationActionType.PHONE_LOGIN_INITIATED;
}

export type AuthenticationAction =
  | ExistingCredentialAction
  | LogInAction
  | SignOutAction
  | SignedOutAction
  | PhoneLoginAction;

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

function setupGoogleSignIn() {
  GoogleSignin.configure({
    iosClientId: config.firebase.ios.clientId,
    webClientId: config.firebase.android.clientId
  });
}
setupGoogleSignIn();

let confirmResult: FirebaseTypes.ConfirmationResult;
export const initiatePhoneLogIn: AsyncActionCreator = (
  phoneNumber: string
) => async dispatch => {
  try {
    dispatch({ type: AuthenticationActionType.PHONE_LOGIN_INITIATED });
    confirmResult = await auth.signInWithPhoneNumber(phoneNumber);
    dispatch({
      type: AuthenticationActionType.PHONE_LOGIN_PENDING_CONFIRMATION
    });
    // TODO: do we need to do anything?
  } catch (err) {
    dispatch({ type: AuthenticationActionType.PHONE_LOGIN_FAILED });
    console.error("Initiating phone log in failed", JSON.stringify(err));
    // TODO: do something
    return;
  }
};

export const confirmPhoneLogIn: AsyncActionCreator = (
  confirmationCode: string
) => async dispatch => {
  try {
    await confirmResult.confirm(confirmationCode);
    dispatch({ type: AuthenticationActionType.PHONE_LOGIN_COMPLETE });
  } catch (err) {
    dispatch({ type: AuthenticationActionType.PHONE_LOGIN_FAILED });
    console.error("Confirming phone log in failed", JSON.stringify(err));
    // TODO: do something
    return;
  }
};

/**
 * TODO: if we make actions general, figure out how to distinguish between
 * mobile-specific login methods like this vs platform-independent ones.
 */
export const googleLogIn: AsyncActionCreator = () => async dispatch => {
  try {
    const googleData = await GoogleSignin.signIn();
    if (!googleData.idToken) {
      // TODO: what to do here?
      throw new Error("Google idToken was null");
    }

    // Create a new Firebase credential with the token
    const credential = RNFirebase.auth.GoogleAuthProvider.credential(
      googleData.idToken,
      googleData.accessToken
    );
    // Login with the credential
    await auth.signInAndRetrieveDataWithCredential(credential);

    const webCredential = firebase.auth.GoogleAuthProvider.credential(
      googleData.idToken,
      googleData.accessToken
    );
    // TODO: remove once storage works for react-native-firebase
    // Also log into the web version of firebase
    await webAuth.signInAndRetrieveDataWithCredential(webCredential);
  } catch (error) {
    // TODO: does declining permissions go here?

    if (error.code === FIREBASE_EXISTING_CREDENTIAL_ERROR_CODE) {
      dispatch(existingCredentialAction(AuthMethod.GOOGLE));
      return;
    }
    // TODO: deal with error
    throw error;
  }
};

export const facebookLogIn: AsyncActionCreator = () => async dispatch => {
  // const facebookData = await Facebook.logInWithReadPermissionsAsync(
  //   config.facebook.appId,
  //   {
  //     permissions: ["public_profile"]
  //   }
  // );
  // if (facebookData.type !== "success" || !facebookData.token) {
  //   // TODO: dispatch something that says it failed?
  //   return;
  // }
  // try {
  //   const credential = auth.FacebookAuthProvider.credential(
  //     facebookData.token
  //   );
  //   await auth.signInAndRetrieveDataWithCredential(credential);
  // } catch (error) {
  //   if (error.code === FIREBASE_EXISTING_CREDENTIAL_ERROR_CODE) {
  //     dispatch(existingCredentialAction(AuthMethod.FACEBOOK));
  //     return;
  //   }
  //   // TODO: handle error;
  //   throw error;
  // }
};

export const signOut: AsyncActionCreator = () => async dispatch => {
  await Promise.all([auth.signOut(), webAuth.signOut()]); // TODO handle error
  dispatch(signOutAction());
};
