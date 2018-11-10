import firebase from "react-native-firebase";
import { ActionCreator } from "redux";

import { validateMobileNumber as callValidateMobileNumber } from "@raha/api/dist/me/validateMobileNumber";
import { ApiCallFailedError } from "@raha/api/dist/errors/ApiCallFailedError";

import { AsyncActionCreator } from ".";
import { auth } from "../../firebaseInit";
import { config } from "../../data/config";
import branch from "react-native-branch";

export enum PhoneLogInActionType {
  PHONE_LOGIN_SENDING_PHONE_NUMBER = "AUTH.PHONE_LOGIN_SENDING_PHONE",
  PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED = "AUTH.PHONE_LOGIN_SENDING_PHONE_FAILED",
  PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT = "AUTH.PHONE_LOGIN_WAITING_FOR_CONF_INPUT",
  PHONE_LOGIN_SENDING_CONFIRMATION = "AUTH.PHONE_LOGIN_SENDING_CONF",
  PHONE_LOGIN_SENDING_CONFIRMATION_FAILED = "AUTH.PHONE_LOGIN_SENDING_CONF_FAILED",
  PHONE_LOGIN_CANCELED = "AUTH.PHONE_LOGIN_CANCELED"
}
export enum FirebaseAuthActionType {
  LOG_IN = "AUTH.LOG_IN",
  // Action used by only on Android when Firebase logs in automatically.
  AUTO_LOG_IN = "AUTH.AUTO_LOG_IN",
  SIGN_OUT = "AUTH.SIGN_OUT",
  SIGNED_OUT = "AUTH.SIGNED_OUT",
  RECEIVED_CODE = "AUTH.RECEIVED_CODE"
}
export type AuthenticationActionType =
  | PhoneLogInActionType
  | FirebaseAuthActionType;

export interface LogInAction {
  type: FirebaseAuthActionType.LOG_IN;
}

export interface ReceivedCodeAction {
  type: FirebaseAuthActionType.RECEIVED_CODE;
  code: string;
}

export interface SignOutAction {
  type: FirebaseAuthActionType.SIGN_OUT;
}
export interface SignedOutAction {
  type: FirebaseAuthActionType.SIGNED_OUT;
}

export type PhoneLogInAction =
  | {
      type:
        | PhoneLogInActionType.PHONE_LOGIN_CANCELED
        | PhoneLogInActionType.PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT
        | PhoneLogInActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER
        | PhoneLogInActionType.PHONE_LOGIN_SENDING_CONFIRMATION;
    }
  | {
      type:
        | PhoneLogInActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED
        | PhoneLogInActionType.PHONE_LOGIN_SENDING_CONFIRMATION_FAILED;
      errorMessage: string;
    };

export type AuthenticationAction =
  | LogInAction
  | ReceivedCodeAction
  | SignOutAction
  | SignedOutAction
  | PhoneLogInAction;

export const logInAction: ActionCreator<LogInAction> = (): LogInAction => ({
  type: FirebaseAuthActionType.LOG_IN
});

export const receivedCodeAction: ActionCreator<ReceivedCodeAction> = (
  code: string
): ReceivedCodeAction => ({
  type: FirebaseAuthActionType.RECEIVED_CODE,
  code: code
});

const signOutAction: ActionCreator<SignOutAction> = (): SignOutAction => ({
  type: FirebaseAuthActionType.SIGN_OUT
});

export const signedOutAction: ActionCreator<SignedOutAction> = () => ({
  type: FirebaseAuthActionType.SIGNED_OUT
});

export const cancelPhoneLogIn: ActionCreator<PhoneLogInAction> = () => ({
  type: PhoneLogInActionType.PHONE_LOGIN_CANCELED
});

const _logInWithCredential = async (
  verificationId: string,
  verificationCode: string
) => {
  const credential = firebase.auth.PhoneAuthProvider.credential(
    verificationId,
    verificationCode
  );
  await auth.signInWithCredential(credential);
};

let verificationId: string;
export const initiatePhoneLogIn: AsyncActionCreator = (
  phoneNumber: string
) => async dispatch => {
  dispatch({
    type: PhoneLogInActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER
  });

  // Handle phone state events manually so that we can know when the user is
  // logged in automatically.
  try {
    await callValidateMobileNumber(config.apiBase, phoneNumber);
    await auth
      .verifyPhoneNumber(phoneNumber)
      .on("state_changed", async snapshot => {
        switch (snapshot.state) {
          case firebase.auth.PhoneAuthState.CODE_SENT:
            // Save verification ID to log in after code input.
            verificationId = snapshot.verificationId;
            dispatch({
              type:
                PhoneLogInActionType.PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT
            });
            break;
          case firebase.auth.PhoneAuthState.ERROR:
            if (snapshot.error) {
              throw snapshot.error;
            }
            break;
          case firebase.auth.PhoneAuthState.AUTO_VERIFIED:
            // This only happens on Android phones. Log in automatically.
            if (snapshot.code) {
              verificationId = snapshot.verificationId;
              dispatch({
                type: FirebaseAuthActionType.RECEIVED_CODE,
                code: snapshot.code
              });
            } else {
              // This is a bit of an odd scenario - but sometimes we receive
              // auto-verified without a code or verificationId attached.
              // We can't manually create the credential in this case, which
              // we were doing to make the sign-in-flow less "magical" and thus confusing,
              // so just do the magical thing instead of breaking.
              auth.signInWithPhoneNumber(phoneNumber);
            }
            break;
        }
      });
  } catch (err) {
    let errorMessage = err.message;
    // TODO: this is probably not what we want to display
    // get API returned error message if parseable
    // TODO: generate messages based on the error code
    if (err instanceof ApiCallFailedError) {
      try {
        const responseBody = await err.response.json();
        errorMessage = responseBody.message;
      } catch (err2) {
        // no-op
      }
    }

    dispatch({
      type: PhoneLogInActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED,
      errorMessage
    });
    console.error("Initiating phone log in failed", errorMessage);
  }
};

export const confirmPhoneLogIn: AsyncActionCreator = (
  confirmationCode: string
) => async dispatch => {
  try {
    dispatch({
      type: PhoneLogInActionType.PHONE_LOGIN_SENDING_CONFIRMATION
    });
    await _logInWithCredential(verificationId, confirmationCode);
    // no need to dispatch success since firebase auth is listening for changes,
    // it will get triggered automatically
  } catch (err) {
    dispatch({
      type: PhoneLogInActionType.PHONE_LOGIN_SENDING_CONFIRMATION_FAILED,
      // TODO: this probably isn't what we want to display
      errorMessage: err.message
    });
    console.warn("Confirming phone log in failed", JSON.stringify(err));
    return;
  }
};

export const initiateEmailLogIn: AsyncActionCreator = (
  emailAddress: string
) => async dispatch => {
  auth.sendSignInLinkToEmail(emailAddress);
};

export const signOut: AsyncActionCreator = () => async dispatch => {
  await auth.signOut(); // TODO handle error
  // Clear deeplinking state
  await branch.logout();
  dispatch(signOutAction());
};
