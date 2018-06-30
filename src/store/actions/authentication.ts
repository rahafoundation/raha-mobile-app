import { RNFirebase as FirebaseTypes } from "react-native-firebase";

import { AsyncActionCreator } from "./";
import { auth, webAuth } from "../../firebaseInit";

export const enum PhoneLoginActionType {
  PHONE_LOGIN_SENDING_PHONE_NUMBER = "AUTHENTICATION.PHONE_LOGIN_SENDING_PHONE_NUMBER",
  PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED = "AUTHENTICATION.PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED",
  PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT = "AUTHENTICATION.PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT",
  PHONE_LOGIN_SENDING_CONFIRMATION = "AUTHENTICATION.PHONE_LOGIN_SENDING_CONFIRMATION",
  PHONE_LOGIN_SENDING_CONFIRMATION_FAILED = "AUTHENTICATION.PHONE_LOGIN_SENDING_CONFIRMATION_FAILED",
  PHONE_LOGIN_CANCELED = "AUTHENTICATION.PHONE_LOGIN_CANCELED"
}
export const enum FirebaseAuthActionType {
  LOG_IN = "AUTHENTICATION.LOG_IN",
  SIGN_OUT = "AUTHENTICATION.SIGN_OUT",
  SIGNED_OUT = "AUTHENTICATION.SIGNED_OUT"
}
export type AuthenticationActionType =
  | PhoneLoginActionType
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

export type PhoneLoginAction =
  | {
      type:
        | PhoneLoginActionType.PHONE_LOGIN_CANCELED
        | PhoneLoginActionType.PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT
        | PhoneLoginActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER
        | PhoneLoginActionType.PHONE_LOGIN_SENDING_CONFIRMATION;
    }
  | {
      type:
        | PhoneLoginActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED
        | PhoneLoginActionType.PHONE_LOGIN_SENDING_CONFIRMATION_FAILED;
      errorMessage: string;
    };

export type AuthenticationAction =
  | LogInAction
  | SignOutAction
  | SignedOutAction
  | PhoneLoginAction;

export const logInAction = (): LogInAction => ({
  type: FirebaseAuthActionType.LOG_IN
});

const signOutAction = (): SignOutAction => ({
  type: FirebaseAuthActionType.SIGN_OUT
});

export const signedOutAction = (): SignedOutAction => ({
  type: FirebaseAuthActionType.SIGNED_OUT
});

let confirmResult: FirebaseTypes.ConfirmationResult;
export const initiatePhoneLogIn: AsyncActionCreator = (
  phoneNumber: string
) => async dispatch => {
  try {
    dispatch({
      type: PhoneLoginActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER
    });
    confirmResult = await auth.signInWithPhoneNumber(phoneNumber);
    dispatch({
      type: PhoneLoginActionType.PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT
    });
    // TODO: do we need to do anything?
  } catch (err) {
    dispatch({
      type: PhoneLoginActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED,
      // TODO: this is probably not what we want to display
      errorMessage: err.message
    });
    console.error("Initiating phone log in failed", JSON.stringify(err));
    return;
  }
};

export const confirmPhoneLogIn: AsyncActionCreator = (
  confirmationCode: string
) => async dispatch => {
  try {
    dispatch({
      type: PhoneLoginActionType.PHONE_LOGIN_SENDING_CONFIRMATION
    });
    await confirmResult.confirm(confirmationCode);
    // no need to dispatch success since firebase auth is listening for changes,
    // it will get triggered automatically
  } catch (err) {
    dispatch({
      type: PhoneLoginActionType.PHONE_LOGIN_SENDING_CONFIRMATION_FAILED,
      // TODO: this probably isn't what we want to display
      errorMessage: err.message
    });
    console.error("Confirming phone log in failed", JSON.stringify(err));
    return;
  }
};

export const signOut: AsyncActionCreator = () => async dispatch => {
  await Promise.all([auth.signOut(), webAuth.signOut()]); // TODO handle error
  dispatch(signOutAction());
};
