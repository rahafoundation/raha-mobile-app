import { Reducer } from "redux";

import { MemberId, MemberUsername, OperationId } from "../../identifiers";
import { OperationsAction, OperationsActionType } from "../actions/operations";

export enum OperationType {
  REQUEST_INVITE = "REQUEST_INVITE",
  TRUST = "TRUST"
}
export interface RequestInvitePayload {
  full_name: string;
  to_uid: MemberId;
  to_mid: MemberUsername;
}
export interface TrustPayload {
  to_uid: MemberId;
  to_mid: MemberUsername;
}

export interface OperationBase {
  id: OperationId;
  creator_mid: MemberUsername;
  creator_uid: MemberId;
}

export type Operation = OperationBase &
  (
    | {
        op_code: OperationType.REQUEST_INVITE;
        data: RequestInvitePayload;
      }
    | {
        op_code: OperationType.TRUST;
        data: TrustPayload;
      });

export type OperationsState = Operation[];

export const reducer: Reducer<OperationsState> = (
  state = [],
  untypedAction
) => {
  const action = untypedAction as OperationsAction;
  switch (action.type) {
    case OperationsActionType.SET_OPERATIONS:
      return action.operations;
    case OperationsActionType.ADD_OPERATIONS:
      return [...state, ...action.operations];
    default:
      return state;
  }
};
