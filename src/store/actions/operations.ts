import { Operation } from "../reducers/operations";
import { ApiEndpoint, callApi, GetOperationsApiEndpoint } from "../../api";
import { AsyncAction, AsyncActionCreator } from "./types";
import { wrapApiCallAction } from "./apiCalls";
import { ActionCreator } from "react-redux";

// TODO: these operations methods are likely correct, but long term inefficient.
// We can rely on it now given that the number and size of operations are small,
// but later rely on cached results instead.
export const refreshOperationsAction: AsyncAction = wrapApiCallAction(
  async dispatch => {
    const operations = await callApi<GetOperationsApiEndpoint>({
      endpoint: ApiEndpoint.GET_OPERATIONS,
      params: undefined,
      body: undefined
    });
    const action: OperationsAction = {
      type: OperationsActionType.SET_OPERATIONS,
      operations
    };
    dispatch(action);
  },
  ApiEndpoint.GET_OPERATIONS,
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
