import { List } from "immutable";

import {
  Operation,
  OperationType,
  RequestVerificationOperation,
  CreateMemberOperation
} from "@raha/api-shared/dist/models/Operation";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { Member } from "../reducers/members";
import { isInviteConfirmed } from "./members";
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

// TODO currently dead code, delete?
export function isUnconfirmedRequestInvite(
  state: RahaState,
  operation: Operation
): boolean {
  if (operation.op_code !== OperationType.REQUEST_INVITE) {
    return false;
  }
  return !isInviteConfirmed(state, operation.creator_uid);
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
