import { Big } from "big.js";

import {
  MintType,
  Operation,
  MintPayload
} from "@raha/api-shared/dist/models/Operation";
import {
  MemberId,
  OperationId
} from "@raha/api-shared/dist/models/identifiers";
import { mint as callMint, MintArgs } from "@raha/api/dist/me/mint";
import { give as callGive, tip as callTip } from "@raha/api/dist/members/give";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { UnauthenticatedError } from "@raha/api/dist/errors/UnauthenticatedError";

import { getAuthToken } from "../selectors/authentication";
import { AsyncActionCreator } from ".";
import { wrapApiCallAction } from "./apiCalls";
import { OperationsAction, OperationsActionType } from "./operations";
import { config } from "../../data/config";

function resolveAfter2Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("resolved");
    }, 500);
  });
}

export const mintBasicIncome: AsyncActionCreator = (
  memberId: MemberId,
  amount: Big
) => {
  return mint(memberId, [
    {
      type: MintType.BASIC_INCOME,
      amount
    }
  ]);
};

export const mintReferralBonus: AsyncActionCreator = (
  amount: Big,
  invitedMemberId: MemberId
) => {
  return mint(invitedMemberId, [
    {
      type: MintType.REFERRAL_BONUS,
      amount,
      invited_member_id: invitedMemberId
    }
  ]);
};

/**
 * Takes multiple mint actions.
 */
export const mint: AsyncActionCreator = (
  apiIdentifier: string,
  mintActions: MintArgs[]
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      await resolveAfter2Seconds();

      debugger;

      // const ops = await Promise.all(
      //   mintActions.map(async w => {
      //     const { body } = await callMint(config.apiBase, authToken, w);
      //     return body;
      //   })
      // );

      // const action: OperationsAction = {
      //   type: OperationsActionType.ADD_OPERATIONS,
      //   operations: ops
      // };
      // dispatch(action);
    },
    ApiEndpointName.MINT,
    apiIdentifier
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

export const tip: AsyncActionCreator = (
  operationIdentifier: string,
  toMemberId: MemberId,
  amount: Big,
  targetOperationId: OperationId
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const { body } = await callTip(
        config.apiBase,
        authToken,
        toMemberId,
        amount,
        targetOperationId
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.TIP,
    operationIdentifier
  );
};
