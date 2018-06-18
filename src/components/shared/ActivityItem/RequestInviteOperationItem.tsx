import * as React from "react";
import { Text } from "react-native";

import { RequestInviteOperation } from "../../../store/reducers/operations";

type RequestInviteOperationItemProps = {
  operation: RequestInviteOperation;
};
export const RequestInviteOperationItem: React.StatelessComponent<
  RequestInviteOperationItemProps
> = operation => {
  return <Text>RequestInvite</Text>;
};
