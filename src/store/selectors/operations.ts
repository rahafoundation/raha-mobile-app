import { List } from "immutable";

import {
  Operation,
  OperationType,
  RequestVerificationOperation,
  CreateMemberOperation
} from "@raha/api-shared/dist/models/Operation";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import {
  Member,
  GENESIS_MEMBER,
  GENESIS_VERIFY_OPS
} from "../reducers/members";
import { isInviteConfirmed, getMemberById } from "./members";
import { RahaState } from "../reducers";

export function getOperationsForType(
  operations: List<Operation>,
  type: OperationType
) {
  return operations.filter(op => op.op_code === type);
}

export function getOperationsForCreator(
  operations: List<Operation>,
  creatorMemberId: MemberId
) {
  return operations.filter(op => op.creator_uid === creatorMemberId);
}

export function getRequestVerificationOperation(
  operations: List<Operation>,
  creatorMemberId: MemberId,
  toMemberId: MemberId
) {
  return operations.filter(
    op =>
      op.op_code === OperationType.REQUEST_VERIFICATION &&
      op.creator_uid === creatorMemberId &&
      op.data.to_uid === toMemberId
  ) as List<RequestVerificationOperation>;
}

export function operationsForMember(
  operations: List<Operation>,
  memberId: MemberId
) {
  return operations.filter(
    op =>
      op.creator_uid === memberId ||
      ("to_uid" in op.data && op.data.to_uid === memberId)
  );
}

export function getCreateMemberOperationFor(state: RahaState, member: Member) {
  return state.operations.find(
    operation =>
      operation.op_code === OperationType.CREATE_MEMBER &&
      operation.creator_uid === member.get("memberId")
  ) as CreateMemberOperation | undefined;
}

/**
 * Get creator of a given operation
 */
export function getOperationCreator(
  state: RahaState,
  operation: Operation
): Member | typeof GENESIS_MEMBER {
  const member = GENESIS_VERIFY_OPS.includes(operation.id)
    ? GENESIS_MEMBER
    : getMemberById(state, operation.creator_uid, { throwIfMissing: true });

  return member;
}
