import * as React from "react";
import { View, StyleSheet } from "react-native";

import { OperationType, Operation } from "../../../store/reducers/operations";
import { GiveOperationItem } from "./GiveOperationItem";
import { MintOperationItem } from "./MintOperationItem";
import { RequestInviteOperationItem } from "./RequestInviteOperationItem";
import { TrustOperationItem } from "./TrustOperationItem";
import { ActivityTemplate } from "./ActivityTemplate";

function renderOperation(
  operation: Operation,
  activityRef?: React.Ref<ActivityTemplate>
) {
  let Component;
  switch (operation.op_code) {
    case OperationType.GIVE:
      return (
        <GiveOperationItem operation={operation} activityRef={activityRef} />
      );
    case OperationType.MINT:
      return (
        <MintOperationItem operation={operation} activityRef={activityRef} />
      );
    case OperationType.REQUEST_INVITE:
      return (
        <RequestInviteOperationItem
          operation={operation}
          activityRef={activityRef}
        />
      );
    case OperationType.TRUST:
      return (
        <TrustOperationItem operation={operation} activityRef={activityRef} />
      );
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
  activityRef?: React.Ref<ActivityTemplate>;
};

export const ActivityItem: React.StatelessComponent<ActivityItemProps> = ({
  operation,
  activityRef
}) => {
  return <View>{renderOperation(operation, activityRef)}</View>;
};

const styles = StyleSheet.create({});
