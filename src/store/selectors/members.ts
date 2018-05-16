import { AppState } from "../reducers";
import { UserId } from "../identifiers";
import { Member } from "../reducers/members";

export function getMembersByUid(
  state: AppState,
  uids: UserId[]
): Array<Member | undefined> {
  return uids.map(uid => state.members.byUid[uid]);
}

export function getMembersByMid(
  state: AppState,
  mids: UserId[]
): Array<Member | undefined> {
  return mids.map(mid => state.members.byMid[mid]);
}
