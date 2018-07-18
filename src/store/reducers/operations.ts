import { Reducer } from "redux";

import { Operation } from "@raha/api/dist/shared/models/Operation";

import { OperationsAction, OperationsActionType } from "../actions/operations";
import { List } from "immutable";

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
