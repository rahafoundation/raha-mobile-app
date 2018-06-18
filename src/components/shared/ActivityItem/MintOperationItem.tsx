import * as React from "react";
import { Text } from "react-native";

import { MintOperation } from "../../../store/reducers/operations";

type MintOperationItemProps = { operation: MintOperation };
export const MintOperationItem: React.StatelessComponent<
  MintOperationItemProps
> = ({ operation }) => {
  return <Text>Mint</Text>;
};
