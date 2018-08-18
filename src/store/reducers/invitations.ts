import { Reducer } from "redux";

import {
  InviteOperation,
  Operation,
  OperationType
} from "@raha/api-shared/dist/models/Operation";

import { Map } from "immutable";
import {
  OperationsActionType,
  SetOperationsAction,
  AddOperationsAction
} from "../actions/operations";

type InvitationsAction = SetOperationsAction | AddOperationsAction;

export interface InvitationsState {
  byInviteToken: Map<string, InviteOperation>;
}

function applyOperation(state: InvitationsState, operation: Operation) {
  if (operation.op_code === OperationType.INVITE) {
    return {
      byInviteToken: state.byInviteToken.set(
        operation.data.invite_token,
        operation
      )
    };
  } else {
    return state;
  }
}

const initialState: InvitationsState = {
  byInviteToken: Map()
};

export const reducer: Reducer<InvitationsState> = (
  state = initialState,
  untypedAction
) => {
  const action = untypedAction as InvitationsAction;
  switch (action.type) {
    case OperationsActionType.ADD_OPERATIONS: {
      return action.operations.reduce(
        (curState, operation) => applyOperation(curState, operation),
        state
      );
    }
    case OperationsActionType.SET_OPERATIONS: {
      return action.operations.reduce(
        (curState, operation) => applyOperation(curState, operation),
        // The SET_OPERATIONS action rebuilds member state from scratch.
        initialState
      );
    }
    default:
      return state;
  }
};
