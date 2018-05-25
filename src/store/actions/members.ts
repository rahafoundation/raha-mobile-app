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
import {
  callApi,
  TrustMemberApiEndpoint,
  ApiEndpoint,
  RequestInviteApiEndpoint,
  SendInviteApiEndpoint
} from "../../api";
import { UserId } from "../../identifiers";
import UnauthenticatedError from "../../errors/ApiCallError/UnauthenticatedError";

export type MembersAction = SetOperationsAction | AddOperationsAction;
export const refreshMembers: AsyncActionCreator = () => {
  return async (dispatch, getState) => {
    // TODO: make this request cached members, not reconstruct from operations
    await refreshOperationsAction(dispatch, getState, undefined);
  };
};

export const trustMember: AsyncActionCreator = (uid: UserId) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());

      const response = await callApi<TrustMemberApiEndpoint>(
        {
          endpoint: ApiEndpoint.TRUST_MEMBER,
          params: { uid },
          body: undefined
        },
        authToken
      );

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [response]
      };
      dispatch(action);
    },
    ApiEndpoint.TRUST_MEMBER,
    uid
  );
};

export const requestInviteFromMember: AsyncActionCreator = (
  uid: UserId,
  fullName: string,
  videoUrl: string,
  creatorMid: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const response = await callApi<RequestInviteApiEndpoint>(
        {
          endpoint: ApiEndpoint.REQUEST_INVITE,
          params: { uid },
          body: {
            fullName,
            videoUrl,
            creatorMid
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
    ApiEndpoint.REQUEST_INVITE,
    uid
  );
};

export const sendInvite: AsyncActionCreator = (inviteEmail: string) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      await callApi<SendInviteApiEndpoint>(
        {
          endpoint: ApiEndpoint.SEND_INVITE,
          params: undefined,
          body: {
            inviteEmail
          }
        },
        authToken
      );
    },
    ApiEndpoint.SEND_INVITE,
    inviteEmail
  );
};
