import { createSelector } from "reselect";
import { Map as ImmutableMap } from "immutable";

import { RahaState } from "../reducers";
import { MemberId, MemberUsername } from "../../identifiers";
import { Member, GENESIS_MEMBER } from "../reducers/members";

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

export function getMemberByUsername(
  state: RahaState,
  username: MemberUsername
): Member | undefined {
  return state.members.byMemberUsername.get(username, undefined);
}

export function getMembersByUsernames(
  state: RahaState,
  usernames: MemberUsername[]
): Array<Member | undefined> {
  return usernames.map(username =>
    state.members.byMemberUsername.get(username, undefined)
  );
}

function getAncestors(
  member: Member,
  byMemberId: ImmutableMap<MemberId, Member>
): Set<MemberId> {
  // Everyone is their own ancestor in this function
  let votingForMember = member as Member | undefined;
  const ancestors = new Set<MemberId>();
  for (
    let votingForId: MemberId | typeof GENESIS_MEMBER = member.memberId;
    votingForId !== GENESIS_MEMBER; // TODO needs to change to check if voting for self
    votingForId = votingForMember.invitedBy // TODO needs to change to votingFor
  ) {
    votingForMember = byMemberId.get(votingForId);
    if (votingForMember === undefined) {
      throw Error(`Cannot vote for invalid uid ${votingForId}`);
    }
    if (ancestors.has(votingForId)) {
      throw Error(
        `Cycle in ancestors of ${member.memberId}: ${votingForId} found twice`
      );
    }
    ancestors.add(votingForId);
  }
  return ancestors;
}

function incrementKey(counts: Map<any, number>, key: any) {
  const count = counts.get(key);
  counts.set(key, count === undefined ? 1 : count + 1);
}

function incVotesForAncestors(
  member: Member,
  membersByUid: ImmutableMap<MemberId, Member>,
  votesByUid: Map<MemberId, number>
) {
  const ancestors = getAncestors(member, membersByUid);
  ancestors.forEach(a => incrementKey(votesByUid, a));
}

function getSortedMembersAndScore(
  state: RahaState,
  rankFn: (member: Member) => number
): [Member, number][] {
  let membersAndScore = state.members.byUserId
    .valueSeq()
    .map((m): [Member, number] => [m, rankFn(m)])
    .toArray();
  membersAndScore.sort((a, b) => b[1] - a[1]);
  return membersAndScore;
}

function getMembersById(state: RahaState) {
  return state.members.byUserId;
}

// Cache using createSelector because computation is fairly expensive
export const getVoteCountById = createSelector(
  [getMembersById],
  membersById => {
    const votesByUid = new Map<MemberId, number>();
    membersById
      .valueSeq()
      .forEach(m => incVotesForAncestors(m, membersById, votesByUid));
    return votesByUid;
  }
);

export function getMembersSortedByTrust(state: RahaState) {
  return getSortedMembersAndScore(state, m => m.trustedBy.size);
}

export function getMembersSortedByInvites(state: RahaState) {
  return getSortedMembersAndScore(state, m => m.invited.size);
}

export function getMembersSortedByVotes(state: RahaState) {
  const voteCountById = getVoteCountById(state);
  return getSortedMembersAndScore(state, m => {
    const voteCount = voteCountById.get(m.memberId);
    return voteCount === undefined ? 0 : voteCount;
  });
}
