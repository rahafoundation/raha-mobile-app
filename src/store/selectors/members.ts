import { AppState } from "../reducers";
import { UserId } from "../../identifiers";
import { Member } from "../reducers/members";

export function getMembersByUid(
  state: AppState,
  uids: UserId[]
): Array<Member | undefined> {
  return uids.map(uid => state.members.byUserId.get(uid));
}

export function getMembersByMid(
  state: AppState,
  mids: UserId[]
): Array<Member | undefined> {
  return mids.map(mid => state.members.byMemberUsername.get(mid));
}
