import { Reducer } from "redux";

import {
  FirebaseAuthActionType,
  AuthenticationAction,
  PhoneLoginActionType
} from "../actions/authentication";

export enum PhoneLoginStatus {
  SENDING_PHONE_NUMBER = "SENDING_PHONE_NUMBER",
  WAITING_FOR_CONFIRMATION_INPUT = "WAITING_FOR_CONFIRMATION_INPUT",
  SENDING_CONFIRMATION = "SENDING_CONFIRMATION",
  SENDING_PHONE_NUMBER_FAILED = "SENDING_PHONE_NUMBER_FAILED",
  SENDING_CONFIRMATION_FAILED = "SENDING_CONFIRMATION_FAILED"
}

export interface AuthenticationState {
  isLoaded: boolean;
  isLoggedIn: boolean;
  phoneLoginStatus?:
    | {
        status:
          | PhoneLoginStatus.SENDING_PHONE_NUMBER
          | PhoneLoginStatus.WAITING_FOR_CONFIRMATION_INPUT
          | PhoneLoginStatus.SENDING_CONFIRMATION;
      }
    | {
        status:
          | PhoneLoginStatus.SENDING_PHONE_NUMBER_FAILED
          | PhoneLoginStatus.SENDING_CONFIRMATION_FAILED;
        errorMessage: string;
      };
}

const initialState: AuthenticationState = {
  isLoaded: false,
  isLoggedIn: false
};

export const reducer: Reducer<AuthenticationState> = (
  state = initialState,
  untypedAction
) => {
  const action = untypedAction as AuthenticationAction;
  switch (action.type) {
    case FirebaseAuthActionType.LOG_IN: {
      // clear phone login status since we will transition out of the phone
      // login flow now
      const { phoneLoginStatus, ...rest } = state;
      return {
        ...rest,
        isLoaded: true,
        isLoggedIn: true
      };
    }
    case FirebaseAuthActionType.SIGN_OUT:
    case FirebaseAuthActionType.SIGNED_OUT:
      // clear phone login status just in case.
      const { phoneLoginStatus, ...rest } = state;
      return {
        ...rest,
        isLoaded: true,
        isLoggedIn: false
      };
    case PhoneLoginActionType.PHONE_LOGIN_CANCELED: {
      // clear phone login status
      const { phoneLoginStatus, ...rest } = state;
      return rest;
    }
    case PhoneLoginActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER:
      return {
        ...state,
        phoneLoginStatus: { status: PhoneLoginStatus.SENDING_PHONE_NUMBER }
      };
    case PhoneLoginActionType.PHONE_LOGIN_SENDING_PHONE_NUMBER_FAILED:
      return {
        ...state,
        phoneLoginStatus: {
          status: PhoneLoginStatus.SENDING_PHONE_NUMBER_FAILED,
          errorMessage: action.errorMessage
        }
      };
    case PhoneLoginActionType.PHONE_LOGIN_WAITING_FOR_CONFIRMATION_INPUT:
      return {
        ...state,
        phoneLoginStatus: {
          status: PhoneLoginStatus.WAITING_FOR_CONFIRMATION_INPUT
        }
      };
    case PhoneLoginActionType.PHONE_LOGIN_SENDING_CONFIRMATION:
      return {
        ...state,
        phoneLoginStatus: {
          status: PhoneLoginStatus.SENDING_CONFIRMATION
        }
      };
    case PhoneLoginActionType.PHONE_LOGIN_SENDING_CONFIRMATION_FAILED:
      return {
        ...state,
        phoneLoginStatus: {
          status: PhoneLoginStatus.SENDING_CONFIRMATION_FAILED,
          errorMessage: action.errorMessage
        }
      };
    default:
      return state;
  }
};
