import { Reducer } from "redux";
import { User as FirebaseUser } from "firebase";

import {
  AuthenticationActionType,
  AuthenticationAction,
  AuthMethod
} from "../actions/authentication";

export interface AuthenticationState {
  firebaseUser?: FirebaseUser;
  isLoaded: boolean;
  existingAuthMethod?: AuthMethod;
}

const initialState: AuthenticationState = {
  isLoaded: false
};

export const reducer: Reducer<AuthenticationState> = (
  state = initialState,
  untypedAction
) => {
  const action = untypedAction as AuthenticationAction;
  switch (action.type) {
    case AuthenticationActionType.SET_FIREBASE_USER:
      return {
        isLoaded: true,
        firebaseUser: action.firebaseUser,
        existingAuthMethod: undefined
      };
    case AuthenticationActionType.EXISTING_CREDENTIAL:
      return {
        isLoaded: false,
        firebaseUser: undefined,
        existingAuthMethod: action.authMethod
      };
    default:
      return state;
  }
};
