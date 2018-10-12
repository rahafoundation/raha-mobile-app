import { Member } from "../reducers/members";
import { RahaState } from "../reducers";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { getMemberById } from "./members";
import { OperationType } from "@raha/api-shared/dist/models/Operation";

export const VERIFICATIONS_REQUIRED_TO_FLAG = 5;

function _isInGoodStanding(member: Member) {
  const isVerified = member.get("isVerified");
  const isFlagged = member.get("operationsFlaggingThisMember").size > 0;
  return isVerified && !isFlagged;
}

/**
 * A member in good standing has been verified and is not flagged.
 *
 * This function only takes a MemberId and not a Member object to ensure that
 * it always retrieves the latest state from the Redux store. Passing a
 * Member object directly could result in stale data being used to determing
 * a member's status.
 */
export function isInGoodStanding(
  state: RahaState,
  memberId: MemberId
): boolean {
  const member = getMemberById(state, memberId, { throwIfMissing: true });
  return _isInGoodStanding(member);
}

function _canFlag(member: Member): boolean {
  return (
    _isInGoodStanding(member) &&
    member.get("verifiedBy").size >= VERIFICATIONS_REQUIRED_TO_FLAG
  );
}

/**
 * Return whether or not the member can perform flag operations.
 *
 * This function only takes a MemberId and not a Member object to ensure that
 * it always retrieves the latest state from the Redux store. Passing a
 * Member object directly could result in stale data being used to determing
 * a member's status.
 */
export function canFlag(state: RahaState, memberId: MemberId): boolean {
  const member = getMemberById(state, memberId, { throwIfMissing: true });
  return _canFlag(member);
}

export function canCreateOperation(
  state: RahaState,
  operationType: OperationType,
  memberId?: MemberId
): boolean {
  const member = memberId
    ? getMemberById(state, memberId, { throwIfMissing: true })
    : undefined;

  if (member) {
    switch (operationType) {
      case OperationType.EDIT_MEMBER:
      case OperationType.REQUEST_VERIFICATION:
        return true;
      case OperationType.FLAG_MEMBER:
      case OperationType.RESOLVE_FLAG_MEMBER:
        return _canFlag(member);
      case OperationType.GIVE:
      case OperationType.INVITE:
      case OperationType.MINT:
      case OperationType.TRUST:
      case OperationType.VERIFY:
        return _isInGoodStanding(member);
      case OperationType.CREATE_MEMBER:
        // An existing member cannot perform a CREATE_MEMBER operation.
        return false;
      default:
        console.warn(
          `Unexpected operation type when determining member abilities: ${operationType}`
        );
        return false;
    }
  } else {
    if (operationType === OperationType.CREATE_MEMBER) {
      return true;
    }
    return false;
  }
}
