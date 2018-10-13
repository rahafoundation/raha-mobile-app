import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../reducers";
import { auth, storage } from "../../firebaseInit";
import { STATUS_CODES } from "http";

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

/**
 * Use this to get the Firebase userId regardless of whether the user has already created an account.
 */
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
 * Use this if you only want the memberId if the user has created an account already.
 */
export function getLoggedInMemberId(state: RahaState) {
  const loggedInMember = getLoggedInMember(state);
  return loggedInMember ? loggedInMember.get("memberId") : undefined;
}

/**
 * Videos put into this bucket are restricted to logged-in users only.
 * TODO we should eventually just use this everywhere instead of type-specific video urls.
 * @param token A unique string (UUID) by which to identify the uploaded video.
 */
function getAuthRestrictedVideoBucketRef(token: string) {
  return storage
    .ref()
    .child("private-video")
    .child(token);
}

/**
 * Gets ref to video in the Raha video bucket restricted to logged-in users
 * only.
 * @param token A unique string (UUID) by which to identify the uploaded video.
 */
export function getAuthRestrictedVideoRef(token: string) {
  return getAuthRestrictedVideoBucketRef(token).child("video.mp4");
}

/**
 * Gets ref to thumbnail of a video in the Raha video bucket restricted to
 * logged-in users only.
 * @param token A unique string (UUID) by which to identify the uploaded video.
 */
export function getAuthRestrictedVideoThumbnailRef(token: string) {
  return getAuthRestrictedVideoBucketRef(token).child("thumbnail.jpg");
}
