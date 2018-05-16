import { Reducer } from "redux";
import { User as FirebaseUser } from "firebase";

import {
  SET_FIREBASE_USER,
  SetFirebaseUserAction
} from "../actions/authentication";

export interface AuthenticationState {
  firebaseUser?: FirebaseUser;
  isLoaded: boolean;
}
type AuthAction = SetFirebaseUserAction;

const initialState: AuthenticationState = {
  isLoaded: false
};

export const reducer: Reducer<AuthenticationState> = (
  state = initialState,
  untypedAction
) => {
  const action = untypedAction as AuthAction;
  switch (action.type) {
    case SET_FIREBASE_USER:
      return { isLoaded: true, firebaseUser: action.firebaseUser };
    default:
      return state;
  }
};
