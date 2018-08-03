import { List } from "immutable";

import {
  Operation,
  OperationType
} from "@raha/api-shared/dist/models/Operation";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

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
