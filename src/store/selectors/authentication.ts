import { MemberId } from "@raha/api/dist/shared/models/identifiers";

import { RahaState } from "../reducers";
import { auth, webStorage } from "../../firebaseInit";

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

export function getLoggedInFirebaseUserId(state: RahaState) {
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
  const loggedInUserId = getLoggedInFirebaseUserId(state);
  return loggedInUserId
    ? webStorage
        .ref()
        .child("private-video")
        .child(loggedInUserId)
        .child("invite.mp4")
    : undefined;
}

export function getInviteVideoRef(token: string) {
  return webStorage
    .ref()
    .child("invite-video")
    .child(token)
    .child("invite.mp4");
}
