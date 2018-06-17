import { Operation } from "../store/reducers/operations";

export type OperationApiResponse = Operation;
export type OperationsApiResponse = Operation[];
export interface MessageApiResponse {
  message: string;
}

// as more response types appear, expand this type
export type ApiResponse =
  | OperationApiResponse
  | OperationsApiResponse
  | MessageApiResponse;
