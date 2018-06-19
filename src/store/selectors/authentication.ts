import { RahaState } from "../reducers";
import { auth } from "../../firebaseInit";

export async function getAuthToken(
  state: RahaState
): Promise<string | undefined> {
  const authFirebaseUser = state.authentication.firebaseUser;
  if (!authFirebaseUser) {
    // TODO: trigger login or error
    return;
  }
  // console.error(auth.currentUser.getIdToken);
  const authToken = auth.currentUser.getIdToken();
  // const authToken = await authFirebaseUser.getIdToken();
  return authToken;
}

export function getLoggedInMember(state: RahaState) {
  const loggedInUserId = !!state.authentication.firebaseUser
    ? state.authentication.firebaseUser.uid
    : undefined;
  return loggedInUserId
    ? state.members.byUserId.get(loggedInUserId)
    : undefined;
}
