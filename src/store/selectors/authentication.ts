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

/**
 * Videos put into this bucket are restricted to logged-in users only.
 * TODO we should eventually just use this everywhere instead of type-specific video urls.
 * @param token A unique string (UUID) by which to identify the uploaded video.
 */
export function getAuthRestrictedVideoRef(token: string) {
  return storage
    .ref()
    .child("private-video")
    .child(token)
    .child("video.mp4");
}
