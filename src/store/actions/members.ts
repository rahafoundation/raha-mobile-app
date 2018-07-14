import { trust as callTrust } from "@raha/api/dist/client/members/trust";
import { requestInvite as callRequestInvite } from "@raha/api/dist/client/members/requestInvite";
import { sendInvite as callSendInvite } from "@raha/api/dist/client/me/sendInvite";
import { ApiEndpointName } from "@raha/api/dist/shared/types/ApiEndpoint";
import { MemberId } from "@raha/api/dist/shared/models/identifiers";

import {
  SetOperationsAction,
  AddOperationsAction,
  refreshOperationsAction,
  OperationsAction,
  OperationsActionType
} from "./operations";
import { AsyncActionCreator } from "./";
import { wrapApiCallAction } from "./apiCalls";
import { getAuthToken } from "../selectors/authentication";
import { UnauthenticatedError } from "../../errors/ApiCallError/UnauthenticatedError";
import { config } from "../../data/config";

export type MembersAction = SetOperationsAction | AddOperationsAction;
export const refreshMembers: AsyncActionCreator = () => {
  return async (dispatch, getState) => {
    // TODO: make this request cached members, not reconstruct from operations
    await refreshOperationsAction(dispatch, getState, undefined);
  };
};

export const trustMember: AsyncActionCreator = (memberId: MemberId) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const { body } = await callTrust(config.apiBase, authToken, memberId);

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.TRUST_MEMBER,
    memberId
  );
};

export const requestInviteFromMember: AsyncActionCreator = (
  memberId: MemberId,
  fullName: string,
  videoUrl: string,
  username: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const { body } = await callRequestInvite(
        config.apiBase,
        authToken,
        memberId,
        fullName,
        videoUrl,
        username
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.REQUEST_INVITE,
    memberId
  );
};

export const sendInvite: AsyncActionCreator = (
  inviteEmail: string,
  videoToken: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      await callSendInvite(config.apiBase, authToken, inviteEmail, videoToken);
    },
    ApiEndpointName.SEND_INVITE,
    inviteEmail
  );
};
