import * as React from "react";
import { View, StyleSheet } from "react-native";

import { OperationType, Operation } from "../../../store/reducers/operations";
import { GiveOperationItem } from "./GiveOperationItem";
import { MintOperationItem } from "./MintOperationItem";
import { RequestInviteOperationItem } from "./RequestInviteOperationItem";
import { TrustOperationItem } from "./TrustOperationItem";

function renderOperation(operation: Operation) {
  switch (operation.op_code) {
    case OperationType.GIVE:
      return <GiveOperationItem operation={operation} />;
    case OperationType.MINT:
      return <MintOperationItem operation={operation} />;
    case OperationType.REQUEST_INVITE:
      return <RequestInviteOperationItem operation={operation} />;
    case OperationType.TRUST:
      return <TrustOperationItem operation={operation} />;
    default:
      // Shouldn't happen. Type assertion is because TypeScript also thinks this
      // should never happen.
      // TODO: ensure this error gets sent somewhere
      console.error(
        new Error(
          `Invalid operation: Unrecognized opcode "${
            (operation as Operation).op_code
          }". Operation: ${JSON.stringify(operation)}`
        )
      );
      return <View />;
  }
}

type ActivityItemProps = {
  operation: Operation;
};

export const ActivityItem: React.StatelessComponent<ActivityItemProps> = ({
  operation
}) => {
  return <View style={styles.item}>{renderOperation(operation)}</View>;
};

const styles = StyleSheet.create({
  item: {
    padding: 12
  }
});
