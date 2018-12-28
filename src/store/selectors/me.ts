import Big from "big.js";
import { List } from "immutable";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  MintOperation,
  OperationType,
  MintType,
  MintReferralBonusPayload
} from "@raha/api-shared/dist/models/Operation";

import { RahaState } from "..";
import { getMemberById } from "./members";
import { getOperationsForCreator, getOperationsForType } from "./operations";

// TODO(tina): Get from shared config when Mark's code is checked in
export const RAHA_MINT_WEEKLY_RATE = new Big(10);
export const MAX_WEEKS_ACCRUE = new Big(4);
export const RAHA_MINT_CAP = RAHA_MINT_WEEKLY_RATE.times(MAX_WEEKS_ACCRUE);
export const REFERRAL_BONUS = new Big(60);
export const REFERRAL_BONUS_PRE_SPLIT = new Big(60);
export const REFERRAL_BONUS_POST_SPLIT = new Big(30);
const MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

// Set to midnight on Jan 1st, 2019 UTC
const REFERRAL_BONUS_SPLIT_TRANSITION_DATE_UTC = Date.UTC(2019, 0, 1);

/**
 * Return whether or not we're past the transition to split referral bonus to 30/30.
 * TODO: This code can be removed after the mint cap transition date has passed.
 */
export function isPastReferralBonusSplitTransitionDate() {
  return Date.now() >= REFERRAL_BONUS_SPLIT_TRANSITION_DATE_UTC;
}

// TODO(tina): Replace
export function getReferralBonus(): Big | undefined {
  return undefined;
}

export function getMintableAmount(
  state: RahaState,
  memberId: MemberId
): Big | undefined {
  const member = getMemberById(state, memberId);
  if (member) {
    const maxMintable = new Big(
      new Date().getTime() - member.get("lastMintedBasicIncomeAt").getTime()
    )
      .div(MILLISECONDS_PER_WEEK)
      .times(RAHA_MINT_WEEKLY_RATE)
      .round(2, 0);
    return maxMintable.gt(RAHA_MINT_CAP) ? RAHA_MINT_CAP : maxMintable;
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

    return Array.from(
      member
        .get("invited")
        .subtract(claimedIds)
        .values()
    );
  }
  return undefined;
}
