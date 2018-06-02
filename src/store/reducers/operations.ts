import { Reducer } from "redux";

import { MemberId, MemberUsername, OperationId } from "../../identifiers";
import { OperationsAction, OperationsActionType } from "../actions/operations";
import { List } from "immutable";

export enum OperationType {
  REQUEST_INVITE = "REQUEST_INVITE",
  TRUST = "TRUST",
  MINT = "MINT",
  GIVE = "GIVE"
}
export interface RequestInvitePayload {
  full_name: string;
  to_uid: MemberId;
  username: MemberUsername;
}
export interface TrustPayload {
  to_uid: MemberId;
  to_mid: MemberUsername;
}
export interface MintPayload {
  amount: string;
}
export interface GivePayload {
  to_uid: MemberId;
  amount: string;
  memo: string;
  donation_to: MemberId;
  donation_amount: string;
}

export interface OperationBase {
  id: OperationId;
  creator_uid: MemberId;
  created_at: string;
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
      }
    | {
        op_code: OperationType.MINT;
        data: MintPayload;
      }
    | {
        op_code: OperationType.GIVE;
        data: GivePayload;
      });

export type OperationsState = List<Operation>;

export const reducer: Reducer<OperationsState> = (
  prevState = List(),
  untypedAction
) => {
  const action = untypedAction as OperationsAction;
  switch (action.type) {
    case OperationsActionType.SET_OPERATIONS:
      return List(action.operations);
    case OperationsActionType.ADD_OPERATIONS:
      return prevState.push(...action.operations);
    default:
      return prevState;
  }
};
