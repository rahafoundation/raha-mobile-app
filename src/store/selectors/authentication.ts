import { AppState } from "../reducers";

export async function getAuthToken(
  state: AppState
): Promise<string | undefined> {
  const authFirebaseUser = state.authentication.firebaseUser;
  if (!authFirebaseUser) {
    // TODO: trigger login or error
    return;
  }
  const authToken = await authFirebaseUser.getIdToken();
  return authToken;
}

export function getLoggedInMember(state: AppState) {
  const loggedInUserId = !!state.authentication.firebaseUser
    ? state.authentication.firebaseUser.uid
    : undefined;
  return loggedInUserId
    ? state.members.byUserId.get(loggedInUserId)
    : undefined;
}
