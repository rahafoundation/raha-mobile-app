import { UnauthenticatedError } from "@raha/api/dist/errors/UnauthenticatedError";
import { editMember as callEditMember } from "@raha/api/dist/me/editMember";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { MemberId } from "@raha/api-shared/dist/models/identifiers";

import { config } from "../../data/config";
import { OperationsAction, OperationsActionType } from "./operations";
import { wrapApiCallAction } from "./apiCalls";
import { AsyncActionCreator } from ".";
import { getAuthToken } from "../selectors/authentication";

export const editMember: AsyncActionCreator = (
  apiCallId: string,
  fullName?: string,
  username?: string
) => {
  return wrapApiCallAction(
    async (dispatch, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      const { body } = await callEditMember(config.apiBase, authToken, {
        full_name: fullName,
        username
      });

      const action: OperationsAction = {
        type: OperationsActionType.ADD_OPERATIONS,
        operations: [body]
      };
      dispatch(action);
    },
    ApiEndpointName.EDIT_MEMBER,
    apiCallId
  );
};
