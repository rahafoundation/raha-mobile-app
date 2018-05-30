import { RahaState } from "../reducers";
import { MemberId, MemberUsername } from "../../identifiers";
import { Member } from "../reducers/members";

export function getMembersByIds(
  state: RahaState,
  ids: MemberId[]
): Array<Member | undefined> {
  return ids.map(id => state.members.byUserId.get(id));
}

export function getMembersByUsernames(
  state: RahaState,
  usernames: MemberUsername[]
): Array<Member | undefined> {
  return usernames.map(username =>
    state.members.byMemberUsername.get(username)
  );
}
