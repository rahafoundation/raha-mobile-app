import { RahaState } from "../reducers";
import { auth } from "../../firebaseInit";
import { MemberId } from "../../identifiers";
import * as firebase from "firebase";

export async function getAuthToken(
  state: RahaState
): Promise<string | undefined> {
  const authFirebaseUser = state.authentication.isLoggedIn
    ? auth.currentUser
    : undefined;
  if (!authFirebaseUser) {
    // TODO: trigger login or error
    return;
  }
  return authFirebaseUser.getIdToken();
}

export function getLoggedInMemberId(state: RahaState) {
  return state.authentication.isLoggedIn && auth.currentUser
    ? (auth.currentUser.uid as MemberId)
    : undefined;
}

export function getLoggedInFirebaseUser(state: RahaState) {
  return state.authentication.isLoggedIn && auth.currentUser
    ? auth.currentUser
    : undefined;
}

export function getLoggedInMember(state: RahaState) {
  const loggedInUserId =
    state.authentication.isLoggedIn && auth.currentUser
      ? auth.currentUser.uid
      : undefined;
  return loggedInUserId
    ? state.members.byUserId.get(loggedInUserId)
    : undefined;
}

export function getPrivateVideoInviteRef(state: RahaState) {
  const loggedInUserId = !!state.authentication.firebaseUser
    ? state.authentication.firebaseUser.uid
    : undefined;
  return loggedInUserId
    ? firebase
        .storage()
        .ref()
        .child("private-video")
        .child(loggedInUserId)
        .child("invite.mp4")
    : undefined;
}
