import { createSelector } from "reselect";
import { Map as ImmutableMap } from "immutable";

import { MemberId, MemberUsername } from "@raha/api-shared/dist/models/identifiers";

import { RahaState } from "../reducers";
import { Member, GENESIS_MEMBER } from "../reducers/members";

export function getMemberById(
  state: RahaState,
  id: MemberId
): Member | undefined {
  return state.members.byMemberId.get(id, undefined);
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

/**
 * @param member Return all ancestors of this member.
 * @param byMemberId Map from member id to member.
 * @return A 2-element array of the set of all ancestors and ordered array of all ancestors.
 * Everyone is their own ancestor, so given a valid member this is guaranteed to contain at least one.
 */
function getAncestors(
  member: Member,
  byMemberId: ImmutableMap<MemberId, Member>
): [Set<MemberId>, Array<MemberId>] {
  // Everyone is their own ancestor in this function
  let votingForMember = member as Member | undefined;
  const ancestorsSet = new Set<MemberId>();
  const ancestorsArray = [];
  let last = votingForMember;
  for (
    let votingForId: MemberId | typeof GENESIS_MEMBER = member.get("memberId");
    votingForId !== GENESIS_MEMBER; // TODO needs to change to check if voting for self
    votingForId = votingForMember.get("invitedBy") // TODO needs to change to votingFor
  ) {
    votingForMember = byMemberId.get(votingForId);
    if (votingForMember === undefined) {
      throw Error(`Cannot vote for invalid uid ${votingForId}`);
    }
    last = votingForMember;
    if (ancestorsSet.has(votingForId)) {
      throw Error(
        `Cycle in ancestors of ${member.get(
          "memberId"
        )}: ${votingForId} found twice`
      );
    }
    ancestorsSet.add(votingForId);
    ancestorsArray.push(votingForId);
  }
  if (last === undefined)
    throw Error("Found no last ancestor including self, this is a bug.");
  return [ancestorsSet, ancestorsArray];
}

export function getAncestorsArray(
  member: Member,
  byMemberId: ImmutableMap<MemberId, Member>
): Array<MemberId> {
  return getAncestors(member, byMemberId)[1];
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
  getAncestorsArray(member, membersByUid).forEach(a =>
    incrementKey(votesByUid, a)
  );
}

function getSortedMembersAndScore(
  state: RahaState,
  rankFn: (member: Member) => number
): [Member, number][] {
  let membersAndScore = state.members.byMemberId
    .valueSeq()
    .map((m): [Member, number] => [m, rankFn(m)])
    .toArray();
  membersAndScore.sort((a, b) => b[1] - a[1]);
  return membersAndScore;
}

// Use this when you know you have a valid id
export function getValidMemberById(
  state: RahaState,
  memberId: MemberId
): Member {
  const member = state.members.byMemberId.get(memberId);
  if (!member) {
    throw new Error(
      `Assumed memberId ${memberId} to be valid but did not exist`
    );
  }
  return member;
}

function getMembersById(state: RahaState) {
  return state.members.byMemberId;
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
  return getSortedMembersAndScore(state, m => m.get("trustedBy").size);
}

export function getMembersSortedByInvites(state: RahaState) {
  return getSortedMembersAndScore(state, m => m.get("invited").size);
}

export function getMembersSortedByVotes(state: RahaState) {
  const voteCountById = getVoteCountById(state);
  return getSortedMembersAndScore(state, m => {
    const voteCount = voteCountById.get(m.get("memberId"));
    return voteCount === undefined ? 0 : voteCount;
  });
}

export function getDaysUntilInactive(member: Member) {
  member.get("lastMinted");
}
