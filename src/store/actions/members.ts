import { trust as callTrust } from "@raha/api/dist/members/trust";
import { requestInvite as callRequestInvite } from "@raha/api/dist/members/requestInvite";
import { createMember as callCreateMember } from "@raha/api/dist/members/createMember";
import { verify as callVerify } from "@raha/api/dist/members/verify";
import { sendInvite as callSendInvite } from "@raha/api/dist/me/sendInvite";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";
import { UnauthenticatedError } from "@raha/api/dist/errors/UnauthenticatedError";

import {
  SetOperationsAction,
  AddOperationsAction,
  refreshOperationsAction,
  OperationsAction,
  OperationsActionType
} from "./operations";
import { AsyncActionCreator } from ".";
import { wrapApiCallAction } from "./apiCalls";
import { getAuthToken } from "../selectors/authentication";
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

export const createMember: AsyncActionCreator = (
  fullName: string,
  username: string,
  videoToken: string,
  inviteToken?: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const { body } = await callCreateMember(
        config.apiBase,
        authToken,
        fullName,
        username,
        videoToken,
        inviteToken
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: body
      };
      dispatch(action);
    },
    ApiEndpointName.CREATE_MEMBER,
    fullName
  );
};

export const requestInviteFromMember: AsyncActionCreator = (
  memberId: MemberId,
  fullName: string,
  username: string,
  videoToken?: string
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
        username,
        videoToken
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
  videoToken: string,
  isJointVideo: boolean
) => {
  return wrapApiCallAction(
    async (_, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      await callSendInvite(
        config.apiBase,
        authToken,
        inviteEmail,
        videoToken,
        isJointVideo
      );
    },
    ApiEndpointName.SEND_INVITE,
    videoToken
  );
};

export const verify: AsyncActionCreator = (
  memberId: MemberId,
  videoToken: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const { body } = await callVerify(
        config.apiBase,
        authToken,
        memberId,
        videoToken
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.VERIFY_MEMBER,
    memberId
  );
};
