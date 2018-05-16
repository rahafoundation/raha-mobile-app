import { Action } from "redux";
import { User as FirebaseUser } from "firebase";
import { ActionCreator } from "react-redux";
import { AsyncActionCreator } from "./types";

export const SET_FIREBASE_USER = "SET_FIREBASE_USER";

export interface SetFirebaseUserAction extends Action {
  type: typeof SET_FIREBASE_USER;
  firebaseUser: FirebaseUser;
}

const setFirebaseUser: ActionCreator<SetFirebaseUserAction> = (
  firebaseUser: FirebaseUser
) => ({
  type: SET_FIREBASE_USER,
  firebaseUser
});

export const authSetFirebaseUser: AsyncActionCreator = (
  firebaseUser: FirebaseUser
) => dispatch => {
  dispatch(setFirebaseUser(firebaseUser));
};
