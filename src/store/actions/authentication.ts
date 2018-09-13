import firebase, { RNFirebase as FirebaseTypes } from "react-native-firebase";
import { ActionCreator } from "redux";

import { validateMobileNumber as callValidateMobileNumber } from "@raha/api/dist/me/validateMobileNumber";
import { ApiCallFailedError } from "@raha/api/dist/errors/ApiCallFailedError";
import { ERROR_CODE as DISALLOWED_TYPE_ERROR_CODE } from "@raha/api-shared/dist/errors/RahaApiError/me/validateMobileNumber/DisallowedTypeError";

import { AsyncActionCreator } from ".";
import { auth } from "../../firebaseInit";
import { config } from "../../data/config";

export const enum PhoneLogInActionType {
  PHONE_LOGIN_SENDING_PHONE_NUMBER = "AUTHENTICATION.PHONE_LOGIN_SENDING_PHONE_NUMBER",
  PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED = "AUTHENTICATION.PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED",
  PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT = "AUTHENTICATION.PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT",
  PHONE_LOGIN_SENDING_CONFIRMATION = "AUTHENTICATION.PHONE_LOGIN_SENDING_CONFIRMATION",
  PHONE_LOGIN_SENDING_CONFIRMATION_FAILED = "AUTHENTICATION.PHONE_LOGIN_SENDING_CONFIRMATION_FAILED",
  PHONE_LOGIN_CANCELED = "AUTHENTICATION.PHONE_LOGIN_CANCELED"
}
export const enum FirebaseAuthActionType {
  LOG_IN = "AUTHENTICATION.LOG_IN",
  // Action used by only on Android when Firebase logs in automatically.
  AUTO_LOG_IN = "AUTHENTICATION.AUTO_LOG_IN",
  SIGN_OUT = "AUTHENTICATION.SIGN_OUT",
  SIGNED_OUT = "AUTHENTICATION.SIGNED_OUT"
}
export type AuthenticationActionType =
  | PhoneLogInActionType
  | FirebaseAuthActionType;

export interface LogInAction {
  type: FirebaseAuthActionType.LOG_IN;
}

export interface AutoLogInAction {
  type: FirebaseAuthActionType.AUTO_LOG_IN;
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
  | AutoLogInAction
  | SignOutAction
  | SignedOutAction
  | PhoneLogInAction;

export const logInAction: ActionCreator<LogInAction> = (): LogInAction => ({
  type: FirebaseAuthActionType.LOG_IN
});

export const autoLogInAction: ActionCreator<
  AutoLogInAction
> = (): AutoLogInAction => ({
  type: FirebaseAuthActionType.AUTO_LOG_IN
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
  await firebase.auth().signInAndRetrieveDataWithCredential(credential);
};

let verificationId: string;
export const initiatePhoneLogIn: AsyncActionCreator = (
  phoneNumber: string
) => async dispatch => {
  dispatch({
    type: PhoneLogInActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER
  });

  await callValidateMobileNumber(config.apiBase, phoneNumber);

  // Handle phone state events manually so that we can know when the user is
  // logged in automatically.
  try {
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
              await _logInWithCredential(verificationId, snapshot.code);
              dispatch({
                type: FirebaseAuthActionType.AUTO_LOG_IN
              });
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
    dispatch({ type: FirebaseAuthActionType.LOG_IN });
    // await confirmResult.confirm(confirmationCode);
    // no need to dispatch success since firebase auth is listening for changes,
    // it will get triggered automatically
  } catch (err) {
    dispatch({
      type: PhoneLogInActionType.PHONE_LOGIN_SENDING_CONFIRMATION_FAILED,
      // TODO: this probably isn't what we want to display
      errorMessage: err.message
    });
    console.error("Confirming phone log in failed", JSON.stringify(err));
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
  dispatch(signOutAction());
};
