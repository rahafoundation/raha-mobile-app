import {
  ApiEndpoint,
  callApi,
  MintApiEndpoint,
  GiveApiEndpoint
} from "../../api";
import { MemberId } from "../../identifiers";
import { getAuthToken } from "../selectors/authentication";
import { UnauthenticatedError } from "../../errors/ApiCallError/UnauthenticatedError";
import { AsyncActionCreator } from "./";
import { wrapApiCallAction } from "./apiCalls";
import { OperationsAction, OperationsActionType } from "./operations";

export const mint: AsyncActionCreator = (
  memberId: MemberId,
  amount: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const response = await callApi<MintApiEndpoint>(
        {
          endpoint: ApiEndpoint.MINT,
          params: undefined,
          body: {
            amount
          }
        },
        authToken
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [response]
      };
      dispatch(action);
    },
    ApiEndpoint.MINT,
    memberId
  );
};

export const give: AsyncActionCreator = (
  operationIdentifier: string,
  memberId: MemberId,
  amount: string,
  memo?: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const response = await callApi<GiveApiEndpoint>(
        {
          endpoint: ApiEndpoint.GIVE,
          params: { memberId },
          body: {
            amount,
            memo
          }
        },
        authToken
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [response]
      };
      dispatch(action);
    },
    ApiEndpoint.GIVE,
    operationIdentifier
  );
};
