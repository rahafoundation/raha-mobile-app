import { RahaState } from "../reducers";
import { MemberId } from "../../identifiers";
import { Member } from "../reducers/members";

export function getMembersByIds(
  state: RahaState,
  ids: MemberId[]
): Array<Member | undefined> {
  return ids.map(ids => state.members.byUserId.get(ids, undefined));
}

export function getMembersByUsernames(
  state: RahaState,
  usernames: MemberId[]
): Array<Member | undefined> {
  return usernames.map(username =>
    state.members.byMemberUsername.get(username, undefined)
  );
}
