import { Big } from "big.js";

import {
  ApiEndpoint,
  callApi,
  MintApiEndpoint,
  GiveApiEndpoint
} from "../../api";
import { MemberId, OperationId } from "../../identifiers";
import { MintType } from "../reducers/operations";
import { getAuthToken } from "../selectors/authentication";
import { UnauthenticatedError } from "../../errors/ApiCallError/UnauthenticatedError";
import { AsyncActionCreator } from "./";
import { wrapApiCallAction } from "./apiCalls";
import { OperationsAction, OperationsActionType } from "./operations";

export const mintBasicIncome: AsyncActionCreator = (
  memberId: MemberId,
  amount: Big
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
            type: MintType.BASIC_INCOME,
            amount: amount.toString()
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

export const mintReferralBonus: AsyncActionCreator = (
  amount: Big,
  invitedMemberId: MemberId
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
            type: MintType.REFERRAL_BONUS,
            amount: amount.toString(),
            invited_member_id: invitedMemberId
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
    invitedMemberId
  );
};

export const give: AsyncActionCreator = (
  operationIdentifier: string,
  memberId: MemberId,
  amount: Big,
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
            amount: amount.toString(),
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
