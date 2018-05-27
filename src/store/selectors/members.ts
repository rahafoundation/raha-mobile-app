import { RahaState } from "../reducers";
import { MemberId } from "../../identifiers";
import { Member } from "../reducers/members";

export function getMembersByUid(
  state: RahaState,
  uids: MemberId[]
): Array<Member | undefined> {
  return uids.map(uid => state.members.byUserId.get(uid));
}

export function getMembersByMid(
  state: RahaState,
  mids: MemberId[]
): Array<Member | undefined> {
  return mids.map(mid => state.members.byMemberUsername.get(mid));
}
