import { RahaState } from "../reducers";
import { auth, webStorage } from "../../firebaseInit";
import { MemberId } from "../../identifiers";

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
  const loggedInUserId = getLoggedInMemberId(state);
  return loggedInUserId
    ? webStorage
        .ref()
        .child("private-video")
        .child(loggedInUserId)
        .child("invite.mp4")
    : undefined;
}
