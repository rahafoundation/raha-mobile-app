import Big from "big.js";
import { List, Set } from "immutable";

import { RahaState } from "../";
import { MemberId, OperationId } from "../../identifiers";
import { getMembersByIds } from "./members";
import { getOperationsForCreator, getOperationsForType } from "./operations";
import {
  OperationType,
  MintOperation,
  MintType,
  MintReferralBonusPayload
} from "../reducers/operations";
import { Member } from "../reducers/members";

const RAHA_UBI_WEEKLY_RATE = 10;
const MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

export function getMintableAmount(
  state: RahaState,
  memberId: MemberId
): string | undefined {
  const members = getMembersByIds(state, [memberId]);
  const member = members && members.length > 0 ? members[0] : undefined;
  if (member) {
    return new Big(new Date().getTime() - member.lastMinted.getTime())
      .div(MILLISECONDS_PER_WEEK)
      .times(RAHA_UBI_WEEKLY_RATE)
      .round(2, 0)
      .toString();
  }
  return undefined;
}

/**
 * Return the list of members for whom the member can still claim a referral bonus.
 */
export function getUnclaimedReferrals(
  state: RahaState,
  memberId: MemberId
): MemberId[] | undefined {
  const members = getMembersByIds(state, [memberId]);
  const member = members && members.length === 1 ? members[0] : undefined;
  if (member) {
    const confirmedInvites = member.invited.intersect(member.trusts);

    const memberMintOperations = getOperationsForType(
      getOperationsForCreator(state.operations, memberId),
      OperationType.MINT
    ) as List<MintOperation>;
    const memberIdsOfClaimedBonuses = Set.fromKeys(
      memberMintOperations
        .filter(op => op.data.type === MintType.REFERRAL_BONUS)
        .map(op => {
          (op.data as MintReferralBonusPayload).invited_member_id;
        })
        .values()
    );

    return Array.from(
      confirmedInvites.subtract(memberIdsOfClaimedBonuses).values()
    );
  }
  return undefined;
}
