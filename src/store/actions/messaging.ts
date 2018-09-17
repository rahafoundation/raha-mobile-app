import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";
import { setFcmToken as callSetFcmToken } from "@raha/api/dist/me/setFcmToken";
import { clearFcmToken as callClearFcmToken } from "@raha/api/dist/me/clearFcmToken";
import { UnauthenticatedError } from "@raha/api/dist/errors/UnauthenticatedError";

import { wrapApiCallAction } from "./apiCalls";
import { getAuthToken } from "../selectors/authentication";
import { config } from "../../data/config";
import { generateRandomIdentifier } from "../../helpers/identifiers";

export function clearFcmToken(fcmToken: string) {
  return wrapApiCallAction(
    async () => {
      callClearFcmToken(config.apiBase, fcmToken);
    },
    ApiEndpointName.CLEAR_FCM_TOKEN,
    generateRandomIdentifier()
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
    generateRandomIdentifier()
  );
}
