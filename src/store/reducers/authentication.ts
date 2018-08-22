import { Reducer } from "redux";

import {
  FirebaseAuthActionType,
  AuthenticationAction,
  PhoneLogInActionType
} from "../actions/authentication";

export enum PhoneLogInStatus {
  WAITING_FOR_PHONE_NUMBER_INPUT = "WAITING_FOR_PHONE_NUMBER_INPUT",
  SENDING_PHONE_NUMBER = "SENDING_PHONE_NUMBER",
  WAITING_FOR_CONFIRMATION_INPUT = "WAITING_FOR_CONFIRMATION_INPUT",
  SENDING_CONFIRMATION = "SENDING_CONFIRMATION",
  SENDING_PHONE_NUMBER_FAILED = "SENDING_PHONE_NUMBER_FAILED",
  SENDING_CONFIRMATION_FAILED = "SENDING_CONFIRMATION_FAILED"
}

export interface AuthenticationState {
  isLoaded: boolean;
  isLoggedIn: boolean;
  phoneLogInStatus:
    | {
        status:
          | PhoneLogInStatus.WAITING_FOR_PHONE_NUMBER_INPUT
          | PhoneLogInStatus.SENDING_PHONE_NUMBER
          | PhoneLogInStatus.WAITING_FOR_CONFIRMATION_INPUT
          | PhoneLogInStatus.SENDING_CONFIRMATION;
      }
    | {
        status:
          | PhoneLogInStatus.SENDING_PHONE_NUMBER_FAILED
          | PhoneLogInStatus.SENDING_CONFIRMATION_FAILED;
        errorMessage: string;
      };
}

const initialState: AuthenticationState = {
  phoneLogInStatus: { status: PhoneLogInStatus.WAITING_FOR_PHONE_NUMBER_INPUT },
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
      return {
        // clear phone login status since we will transition out of the phone
        // login flow now
        phoneLogInStatus: {
          status: PhoneLogInStatus.WAITING_FOR_PHONE_NUMBER_INPUT
        },
        isLoaded: true,
        isLoggedIn: true
      };
    }
    case FirebaseAuthActionType.SIGN_OUT:
    case FirebaseAuthActionType.SIGNED_OUT:
      return {
        // clear phone login status just in case.
        phoneLogInStatus: {
          status: PhoneLogInStatus.WAITING_FOR_PHONE_NUMBER_INPUT
        },
        isLoaded: true,
        isLoggedIn: false
      };
    case PhoneLogInActionType.CANCELED: {
      // clear phone login status
      return {
        ...state,
        phoneLogInStatus: {
          status: PhoneLogInStatus.WAITING_FOR_PHONE_NUMBER_INPUT
        }
      };
    }
    case PhoneLogInActionType.SENDING_PHONE_NUMBER:
      return {
        ...state,
        phoneLogInStatus: { status: PhoneLogInStatus.SENDING_PHONE_NUMBER }
      };
    case PhoneLogInActionType.SENDING_PHONE_NUMBER_FAILED:
      return {
        ...state,
        phoneLogInStatus: {
          status: PhoneLogInStatus.SENDING_PHONE_NUMBER_FAILED,
          errorMessage: action.errorMessage
        }
      };
    case PhoneLogInActionType.WAITING_FOR_CONFIRMATION_INPUT:
      return {
        ...state,
        phoneLogInStatus: {
          status: PhoneLogInStatus.WAITING_FOR_CONFIRMATION_INPUT
        }
      };
    case PhoneLogInActionType.SENDING_CONFIRMATION:
      return {
        ...state,
        phoneLogInStatus: {
          status: PhoneLogInStatus.SENDING_CONFIRMATION
        }
      };
    case PhoneLogInActionType.SENDING_CONFIRMATION_FAILED:
      return {
        ...state,
        phoneLogInStatus: {
          status: PhoneLogInStatus.SENDING_CONFIRMATION_FAILED,
          errorMessage: action.errorMessage
        }
      };
    default:
      return state;
  }
};
