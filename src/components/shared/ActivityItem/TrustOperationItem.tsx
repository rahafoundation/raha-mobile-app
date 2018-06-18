import * as React from "react";
import { Text } from "react-native";

import { TrustOperation } from "../../../store/reducers/operations";

type TrustOperationItemProps = {
  operation: TrustOperation;
};
export const TrustOperationItem: React.StatelessComponent<
  TrustOperationItemProps
> = operation => {
  return <Text>Trust</Text>;
};
