import { List } from "immutable";

import { RahaState } from "../reducers";
import { OperationType, Operation } from "../reducers/operations";
import { MemberId } from "../../identifiers";

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
