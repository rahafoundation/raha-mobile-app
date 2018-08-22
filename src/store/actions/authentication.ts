import { RNFirebase as FirebaseTypes } from "react-native-firebase";
import { ActionCreator } from "redux";

import { validateMobileNumber as callValidateMobileNumber } from "@raha/api/dist/me/validateMobileNumber";
import { ApiCallFailedError } from "@raha/api/dist/errors/ApiCallFailedError";

import { AsyncActionCreator } from ".";
import { auth } from "../../firebaseInit";
import { config } from "../../data/config";

export const enum PhoneLogInActionType {
  SENDING_PHONE_NUMBER = "AUTHENTICATION.PHONE_LOGIN.SENDING_PHONE_NUMBER",
  SENDING_PHONE_NUMBER_FAILED = "AUTHENTICATION.PHONE_LOGIN.SENDING_PHONE_NUMBER_FAILED",
  WAITING_FOR_CONFIRMATION_INPUT = "AUTHENTICATION.PHONE_LOGIN.WAITING_FOR_CONFIRMATION_INPUT",
  SENDING_CONFIRMATION = "AUTHENTICATION.PHONE_LOGIN.SENDING_CONFIRMATION",
  SENDING_CONFIRMATION_FAILED = "AUTHENTICATION.PHONE_LOGIN.SENDING_CONFIRMATION_FAILED",
  CANCELED = "AUTHENTICATION.PHONE_LOGIN.CANCELED"
}
export const enum FirebaseAuthActionType {
  LOG_IN = "AUTHENTICATION.FIREBASE_AUTH.LOG_IN",
  SIGN_OUT = "AUTHENTICATION.FIREBASE_AUTH.SIGN_OUT",
  SIGNED_OUT = "AUTHENTICATION.FIREBASE_AUTH.SIGNED_OUT"
}
export type AuthenticationActionType =
  | PhoneLogInActionType
  | FirebaseAuthActionType;

export interface LogInAction {
  type: FirebaseAuthActionType.LOG_IN;
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
        | PhoneLogInActionType.CANCELED
        | PhoneLogInActionType.WAITING_FOR_CONFIRMATION_INPUT
        | PhoneLogInActionType.SENDING_PHONE_NUMBER
        | PhoneLogInActionType.SENDING_CONFIRMATION;
    }
  | {
      type:
        | PhoneLogInActionType.SENDING_PHONE_NUMBER_FAILED
        | PhoneLogInActionType.SENDING_CONFIRMATION_FAILED;
      errorMessage: string;
    };

export type AuthenticationAction =
  | LogInAction
  | SignOutAction
  | SignedOutAction
  | PhoneLogInAction;

export const logInAction: ActionCreator<LogInAction> = (): LogInAction => ({
  type: FirebaseAuthActionType.LOG_IN
});

const signOutAction: ActionCreator<SignOutAction> = (): SignOutAction => ({
  type: FirebaseAuthActionType.SIGN_OUT
});

export const signedOutAction: ActionCreator<SignedOutAction> = () => ({
  type: FirebaseAuthActionType.SIGNED_OUT
});

export const cancelPhoneLogIn: ActionCreator<PhoneLogInAction> = () => ({
  type: PhoneLogInActionType.CANCELED
});

let confirmResult: FirebaseTypes.ConfirmationResult;
export const initiatePhoneLogIn: AsyncActionCreator = (
  phoneNumber: string
) => async dispatch => {
  try {
    dispatch({
      type: PhoneLogInActionType.SENDING_PHONE_NUMBER
    });

    await callValidateMobileNumber(config.apiBase, phoneNumber);

    confirmResult = await auth.signInWithPhoneNumber(phoneNumber);
    dispatch({
      type: PhoneLogInActionType.WAITING_FOR_CONFIRMATION_INPUT
    });
  } catch (err) {
    // TODO: this is probably not what we want to display
    let errorMessage = err.message;
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
      type: PhoneLogInActionType.SENDING_PHONE_NUMBER_FAILED,
      errorMessage
    });
    console.error("Initiating phone log in failed", errorMessage);
    return;
  }
};

export const confirmPhoneLogIn: AsyncActionCreator = (
  confirmationCode: string
) => async dispatch => {
  try {
    dispatch({
      type: PhoneLogInActionType.SENDING_CONFIRMATION
    });
    await confirmResult.confirm(confirmationCode);
    // no need to dispatch success since firebase auth is listening for changes,
    // it will get triggered automatically
  } catch (err) {
    dispatch({
      type: PhoneLogInActionType.SENDING_CONFIRMATION_FAILED,
      // TODO: this probably isn't what we want to display
      errorMessage: err.message
    });
    console.error("Confirming phone log in failed", JSON.stringify(err));
    return;
  }
};

export const signOut: AsyncActionCreator = () => async dispatch => {
  await auth.signOut(); // TODO handle error
  dispatch(signOutAction());
};
