import { setFcmToken as callSetFcmToken } from "@raha/api/dist/me/setFcmToken";
import { clearFcmToken as callClearFcmToken } from "@raha/api/dist/me/clearFcmToken";

import { wrapApiCallAction } from "./apiCalls";
import { getAuthToken } from "../selectors/authentication";
import { config } from "../../data/config";
import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { UnauthenticatedError } from "@raha/api/dist/errors/UnauthenticatedError";

export function clearFcmToken(fcmToken: string) {
  return wrapApiCallAction(
    async (_, getState) => {
      callClearFcmToken(config.apiBase, fcmToken);
    },
    ApiEndpointName.CLEAR_FCM_TOKEN,
    // Arbitrary, we don't track these calls anywhere
    "CLEAR_FCM_TOKEN_CALL"
  );
}

export function setFcmToken(fcmToken: string) {
  return wrapApiCallAction(
    async (_, getState) => {
      const authToken = await getAuthToken(getState());
      if (!authToken) {
        throw new UnauthenticatedError();
      }

      callSetFcmToken(config.apiBase, authToken, fcmToken);
    },
    ApiEndpointName.SET_FCM_TOKEN,
    // Arbitrary, we don't track these calls anywhere
    "SET_FCM_TOKEN_CALL"
  );
}
