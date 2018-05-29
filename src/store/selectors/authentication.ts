import { RahaState } from "../reducers";

export async function getAuthToken(
  state: RahaState
): Promise<string | undefined> {
  const authFirebaseUser = state.authentication.firebaseUser;
  if (!authFirebaseUser) {
    // TODO: trigger login or error
    return;
  }
  const authToken = await authFirebaseUser.getIdToken();
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
