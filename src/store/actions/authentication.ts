import { RNFirebase as FirebaseTypes } from "react-native-firebase";

import { AsyncActionCreator } from "./";
import { auth, webAuth } from "../../firebaseInit";

export const enum AuthenticationActionType {
  LOG_IN = "AUTHENTICATION.LOG_IN",
  SIGN_OUT = "AUTHENTICATION.SIGN_OUT",
  SIGNED_OUT = "AUTHENTICATION.SIGNED_OUT",
  PHONE_LOGIN_STARTED = "AUTHENTICATION.PHONE_LOGIN_INITIATED",
  PHONE_LOGIN_PENDING_CONFIRMATION = "AUTHENTICATION.PHONE_LOGIN_PENDING_CONFIRMATION",
  PHONE_LOGIN_FAILED = "AUTHENTICATION.PHONE_LOGIN_FAILED",
  PHONE_LOGIN_SUCCESS = "AUTHENTICATION.PHONE_LOGIN_COMPLETE",
  PHONE_LOGIN_CANCELED = "AUTHENTICATION.PHONE_LOGIN_CANCELED"
}

export interface LogInAction {
  type: AuthenticationActionType.LOG_IN;
}

export interface SignOutAction {
  type: AuthenticationActionType.SIGN_OUT;
}
export interface SignedOutAction {
  type: AuthenticationActionType.SIGNED_OUT;
}

export type PhoneLoginAction =
  | {
      type:
        | AuthenticationActionType.PHONE_LOGIN_CANCELED
        | AuthenticationActionType.PHONE_LOGIN_SUCCESS
        | AuthenticationActionType.PHONE_LOGIN_PENDING_CONFIRMATION
        | AuthenticationActionType.PHONE_LOGIN_STARTED;
    }
  | {
      type: AuthenticationActionType.PHONE_LOGIN_FAILED;
      errorMessage: string;
    };

export type AuthenticationAction =
  | LogInAction
  | SignOutAction
  | SignedOutAction
  | PhoneLoginAction;

export const logInAction = (): LogInAction => ({
  type: AuthenticationActionType.LOG_IN
});

const signOutAction = (): SignOutAction => ({
  type: AuthenticationActionType.SIGN_OUT
});

export const signedOutAction = (): SignedOutAction => ({
  type: AuthenticationActionType.SIGNED_OUT
});

let confirmResult: FirebaseTypes.ConfirmationResult;
export const initiatePhoneLogIn: AsyncActionCreator = (
  phoneNumber: string
) => async dispatch => {
  try {
    dispatch({ type: AuthenticationActionType.PHONE_LOGIN_STARTED });
    confirmResult = await auth.signInWithPhoneNumber(phoneNumber);
    dispatch({
      type: AuthenticationActionType.PHONE_LOGIN_PENDING_CONFIRMATION
    });
    // TODO: do we need to do anything?
  } catch (err) {
    dispatch({
      type: AuthenticationActionType.PHONE_LOGIN_FAILED,
      // TODO: this probably isn't actually the message we want to display
      errorMessage: err.message
    });
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
    dispatch({ type: AuthenticationActionType.PHONE_LOGIN_SUCCESS });
  } catch (err) {
    dispatch({
      type: AuthenticationActionType.PHONE_LOGIN_FAILED,
      // TODO: this probably isn't actually the message we want to display
      errorMessage: err.message
    });
    console.error("Confirming phone log in failed", JSON.stringify(err));
    // TODO: do something
    return;
  }
};

export const signOut: AsyncActionCreator = () => async dispatch => {
  await Promise.all([auth.signOut(), webAuth.signOut()]); // TODO handle error
  dispatch(signOutAction());
};
