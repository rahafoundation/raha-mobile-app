import { ActionCreator } from "redux";

import { list as callListOperations } from "@raha/api/operations/list";
import { Operation } from "@raha/api-shared/models/Operation";
import { ApiEndpointName } from "@raha/api-shared/routes/ApiEndpoint";

import { AsyncAction, AsyncActionCreator } from "./";
import { wrapApiCallAction } from "./apiCalls";
import { config } from "../../data/config";

// TODO: these operations methods are likely correct, but long term inefficient.
// We can rely on it now given that the number and size of operations are small,
// but later rely on cached results instead.
export const refreshOperationsAction: AsyncAction = wrapApiCallAction(
  async dispatch => {
    const { body } = await callListOperations(config.apiBase);
    const action: OperationsAction = {
      type: OperationsActionType.SET_OPERATIONS,
      operations: body
    };
    dispatch(action);
  },
  ApiEndpointName.GET_OPERATIONS,
  Date.now().toString()
);

export enum OperationsActionType {
  SET_OPERATIONS = "SET_OPERATIONS",
  ADD_OPERATIONS = "ADD_OPERATIONS"
}
export interface SetOperationsAction {
  type: OperationsActionType.SET_OPERATIONS;
  operations: Operation[];
}
export interface AddOperationsAction {
  type: OperationsActionType.ADD_OPERATIONS;
  operations: Operation[];
}
export type OperationsAction = SetOperationsAction | AddOperationsAction;

export const refreshOperations: ActionCreator<
  typeof refreshOperationsAction
> = () => refreshOperationsAction;

export const applyOperation: AsyncActionCreator = (
  operation: Operation
) => async dispatch => {
  const action: AddOperationsAction = {
    type: OperationsActionType.ADD_OPERATIONS,
    operations: [operation]
  };
  dispatch(action);
};
