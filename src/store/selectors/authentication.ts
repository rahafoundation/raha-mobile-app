import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../reducers";
import { auth, storage } from "../../firebaseInit";

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
    ? state.members.byMemberId.get(loggedInUserId)
    : undefined;
}

export function getPrivateVideoInviteRef(state: RahaState) {
  const loggedInUserId = getLoggedInFirebaseUserId(state);
  return loggedInUserId
    ? storage
        .ref()
        .child("private-video")
        .child(loggedInUserId)
        .child("invite.mp4")
    : undefined;
}

export function getInviteVideoRef(token: string) {
  return storage
    .ref()
    .child("invite-video")
    .child(token)
    .child("invite.mp4");
}
