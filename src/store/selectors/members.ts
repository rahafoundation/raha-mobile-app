import { RahaState } from "../reducers";
import { MemberId, MemberUsername } from "../../identifiers";
import { Member } from "../reducers/members";

export function getMemberById(
  state: RahaState,
  id: MemberId
): Member | undefined {
  return state.members.byUserId.get(id, undefined);
}

export function getMembersByIds(
  state: RahaState,
  ids: MemberId[]
): Array<Member | undefined> {
  return ids.map(id => getMemberById(state, id));
}

export function getMembersByUsernames(
  state: RahaState,
  usernames: MemberUsername[]
): Array<Member | undefined> {
  return usernames.map(username =>
    state.members.byMemberUsername.get(username, undefined)
  );
}
