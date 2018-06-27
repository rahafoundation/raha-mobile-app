import Big from "big.js";
import { List, Set } from "immutable";

import { RahaState } from "../";
import { MemberId, OperationId } from "../../identifiers";
import { getMemberById } from "./members";
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
): Big | undefined {
  const member = getMemberById(state, memberId);
  if (member) {
    return new Big(new Date().getTime() - member.lastMinted.getTime())
      .div(MILLISECONDS_PER_WEEK)
      .times(RAHA_UBI_WEEKLY_RATE)
      .round(2, 0);
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
  const member = getMemberById(state, memberId);
  if (member) {
    const memberMintOperations = getOperationsForType(
      getOperationsForCreator(state.operations, memberId),
      OperationType.MINT
    ) as List<MintOperation>;

    const memberReferralOperations = memberMintOperations.filter(
      op => op.data.type === MintType.REFERRAL_BONUS
    );
    const claimedIds = memberReferralOperations.map(
      op => (op.data as MintReferralBonusPayload).invited_member_id
    );

    return Array.from(member.invited.subtract(claimedIds).values());
  }
  return undefined;
}
