import { List } from "immutable";

import {
  Operation,
  OperationType
} from "@raha/api-shared/dist/models/Operation";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { Member } from "../reducers/members";
import { isInviteConfirmed } from "./members";

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

export function isUnconfirmedRequestInvite(
  membersById: Map<MemberId, Member>,
  operation: Operation
): boolean {
  if (operation.op_code !== OperationType.REQUEST_INVITE) {
    return false;
  }
  return !isInviteConfirmed(membersById, operation.creator_uid);
}
