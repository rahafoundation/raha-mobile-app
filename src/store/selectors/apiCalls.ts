import { ApiEndpointName } from "@raha/api-shared/dist/routes/ApiEndpoint";

import { ApiCallStatus } from "../reducers/apiCalls";
import { RahaState } from "../reducers";
import { Map } from "immutable";

/**
 * Gets the status of a previously made API call.
 * @returns If API call has been made, returns its status; otherwise, returns
 * null.
 */
export function getStatusOfApiCall(
  state: RahaState,
  endpoint: ApiEndpointName,
  identifier: string
): ApiCallStatus | undefined {
  return state.apiCalls
    .get(endpoint, Map<string, ApiCallStatus>())
    .get(identifier, undefined);
}
