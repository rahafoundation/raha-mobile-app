import { Big } from "big.js";

import { MintType } from "@raha/api/dist/shared/models/Operation";
import { MemberId } from "@raha/api/dist/shared/models/identifiers";
import { mint as callMint } from "@raha/api/dist/client/me/mint";
import { give as callGive } from "@raha/api/dist/client/members/give";
import { ApiEndpointName } from "@raha/api/dist/shared/types/ApiEndpoint";
import { UnauthenticatedError } from "@raha/api/dist/client/errors/UnauthenticatedError";

import { getAuthToken } from "../selectors/authentication";
import { AsyncActionCreator } from "./";
import { wrapApiCallAction } from "./apiCalls";
import { OperationsAction, OperationsActionType } from "./operations";
import { config } from "../../data/config";

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

      const { body } = await callMint(config.apiBase, authToken, {
        type: MintType.BASIC_INCOME,
        amount
      });

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.MINT,
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

      const { body } = await callMint(config.apiBase, authToken, {
        type: MintType.REFERRAL_BONUS,
        amount,
        invited_member_id: invitedMemberId
      });

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.MINT,
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

      const { body } = await callGive(
        config.apiBase,
        authToken,
        memberId,
        amount,
        memo
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.GIVE,
    operationIdentifier
  );
};
