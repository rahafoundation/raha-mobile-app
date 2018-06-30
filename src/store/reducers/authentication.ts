import { Reducer } from "redux";

import {
  AuthenticationActionType,
  AuthenticationAction
} from "../actions/authentication";

enum PhoneLoginStatus {
  STARTED = "STARTED",
  PENDING_CONFIRMATION = "PENDING_CONFIRMATION",
  FAILED = "FAILED",
  SUCCESS = "SUCCESS"
}
export interface AuthenticationState {
  isLoaded: boolean;
  isLoggedIn: boolean;
  phoneLoginStatus?:
    | {
        status:
          | PhoneLoginStatus.STARTED
          | PhoneLoginStatus.SUCCESS
          | PhoneLoginStatus.PENDING_CONFIRMATION;
      }
    | {
        status: PhoneLoginStatus.FAILED;
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
    case AuthenticationActionType.LOG_IN:
      return {
        ...state,
        isLoaded: true,
        isLoggedIn: true,
        existingAuthMethod: undefined
      };
    case AuthenticationActionType.SIGN_OUT:
    case AuthenticationActionType.SIGNED_OUT:
      return {
        ...state,
        isLoaded: true,
        isLoggedIn: false,
        existingAuthMethod: undefined
      };
    case AuthenticationActionType.PHONE_LOGIN_CANCELED: {
      const { phoneLoginStatus, ...rest } = state;
      return rest;
    }
    case AuthenticationActionType.PHONE_LOGIN_SUCCESS:
      return {
        ...state,
        phoneLoginStatus: { status: PhoneLoginStatus.SUCCESS }
      };
    case AuthenticationActionType.PHONE_LOGIN_PENDING_CONFIRMATION:
      return {
        ...state,
        phoneLoginStatus: { status: PhoneLoginStatus.PENDING_CONFIRMATION }
      };
    case AuthenticationActionType.PHONE_LOGIN_FAILED:
      return {
        ...state,
        phoneLoginStatus: {
          status: PhoneLoginStatus.FAILED,
          errorMessage: action.errorMessage
        }
      };
    case AuthenticationActionType.PHONE_LOGIN_STARTED:
      return {
        ...state,
        phoneLoginStatus: { status: PhoneLoginStatus.STARTED }
      };
    default:
      return state;
  }
};
