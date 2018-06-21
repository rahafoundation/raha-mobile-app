import { Reducer } from "redux";
import { User as FirebaseUser } from "firebase";

import {
  AuthenticationActionType,
  AuthenticationAction,
  AuthMethod
} from "../actions/authentication";

export interface AuthenticationState {
  isLoaded: boolean;
  isLoggedIn: boolean;
  existingAuthMethod?: AuthMethod;
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
        isLoaded: true,
        isLoggedIn: true,
        existingAuthMethod: undefined
      };
    case AuthenticationActionType.EXISTING_CREDENTIAL:
      return {
        isLoaded: false,
        isLoggedIn: false,
        existingAuthMethod: action.authMethod
      };
    case AuthenticationActionType.SIGN_OUT:
    case AuthenticationActionType.SIGNED_OUT:
      return {
        isLoaded: true,
        isLoggedIn: false,
        existingAuthMethod: undefined
      };
    default:
      return state;
  }
};
