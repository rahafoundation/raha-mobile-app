import Big from "big.js";

import { RahaState } from "../";
import { MemberId } from "../../identifiers";
import { getMembersByIds } from "./members";

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
