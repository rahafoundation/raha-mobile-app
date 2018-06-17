import { ApiEndpoint } from "../../api";
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
  endpoint: ApiEndpoint,
  identifier: string
): ApiCallStatus | undefined {
  return state.apiCalls
    .get(endpoint, Map<string, ApiCallStatus>())
    .get(identifier, undefined);
}
