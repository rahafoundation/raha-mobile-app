import firebase from "firebase";
import RNFirebase from "react-native-firebase";
import { GoogleSignin } from "react-native-google-signin";

import { AsyncActionCreator } from "./";
import { auth, webAuth } from "../../firebaseInit";

import { config } from "../../data/config";

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

function setupGoogleSignIn() {
  const { clientId } = config.firebase.ios;
  GoogleSignin.configure({
    iosClientId: clientId
  });
}
setupGoogleSignIn();

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
