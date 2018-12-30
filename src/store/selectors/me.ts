import Big from "big.js";
import { List } from "immutable";

import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  MintOperation,
  OperationType,
  MintType,
  MintReferralBonusPayload
} from "@raha/api-shared/dist/models/Operation";
import { Config } from "@raha/api-shared/dist/helpers/Config";
import { RahaState } from "..";
import { getMemberById } from "./members";
import { getOperationsForCreator, getOperationsForType } from "./operations";
import { Member } from "../reducers/members";

const MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

/**
 * Return whether or not we're past the transition to split referral bonus to 30/30.
 * TODO: This code can be removed after the mint cap transition date has passed.
 */
export function isPastReferralBonusSplitTransitionDate() {
  return Date.now() >= Config.REFERRAL_SPLIT_DATE;
}

<<<<<<< HEAD
export function getMintableAmount(
  state: RahaState,
  loggedInMember: Member
): Big | undefined {
  const basicIncome = getMintableBasicIncomeAmount(
    state,
    loggedInMember.get("memberId")
  );
  const inviteBonus = getInvitedBonusMintableAmount(state, loggedInMember);
  var total = Big(0);
  if (basicIncome) total = total.plus(basicIncome);
  if (inviteBonus) total = total.plus(inviteBonus);
  return total;
}

export function getInvitedBonusMintableAmount(
  state: RahaState,
  loggedInMember: Member
): Big | undefined {
  // Check that invite has been confirmed/verified.
  if (!loggedInMember.get("inviteConfirmed")) {
    return undefined;
  }

  // Check that user has not claimed the bonus before.
  const mintOperations = getOperationsForType(
    getOperationsForCreator(state.operations, loggedInMember.get("memberId")),
    OperationType.MINT
  ) as List<MintOperation>;
  const memberReferralOperations = mintOperations.filter(
    op => op.data.type === MintType.INVITED_BONUS
  );
  if (!memberReferralOperations.isEmpty()) {
    return undefined;
  }

  const bonus = Config.getInvitedBonus(
    loggedInMember.get("createdAt").getTime()
  );
  return bonus;
}

export function getMintableBasicIncomeAmount(
  state: RahaState,
  memberId: MemberId
): Big | undefined {
=======
export function getMintableAmount(state: RahaState, memberId: MemberId): Big {
>>>>>>> WIP animate minting
  const member = getMemberById(state, memberId);
  if (member) {
    const maxMintable = new Big(
      new Date().getTime() - member.get("lastMintedBasicIncomeAt").getTime()
    )
      .div(MILLISECONDS_PER_WEEK)
      .times(Config.UBI_WEEKLY_RATE)
      .round(2, 0);
    return maxMintable.gt(Config.MINT_CAP) ? Config.MINT_CAP : maxMintable;
  }
  return Big(0);
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
