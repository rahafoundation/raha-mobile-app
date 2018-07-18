import Big from "big.js";
import { List } from "immutable";

import { MemberId } from "@raha/api/dist/shared/models/identifiers";
import {
  MintOperation,
  OperationType,
  MintType,
  MintReferralBonusPayload
} from "@raha/api/dist/shared/models/Operation";

import { RahaState } from "../";
import { getMemberById } from "./members";
import { getOperationsForCreator, getOperationsForType } from "./operations";

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
